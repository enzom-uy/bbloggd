import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from 'src/db/db.module';
import * as schema from '../../drizzle/schema';
import { eq, ilike, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'crypto';
import { GameUtilsService } from './games-utils.service';
import { igdbFetch } from 'src/utils/igdb.utils';
import { IGDBGame } from './types/igdb.types';

@Injectable()
export class GamesService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly gameUtilsService: GameUtilsService,
    ) {}

    private readonly gamesTable = schema.games;

    private async findGameInDatabase(gameId: string) {
        const result = await this.db
            .select()
            .from(this.gamesTable)
            .where(eq(this.gamesTable.igdbId, Number(gameId)));
        return result;
    }

    private async getGameCompanies(involvedCompanies: number[]) {
        if (!involvedCompanies?.length) return null;

        const companiesData = {
            developer: '',
            publisher: '',
        };

        const companyPromises = involvedCompanies.map((companyId) =>
            this.gameUtilsService.getInvolvedCompanies(`${companyId}`),
        );

        const companies = await Promise.all(companyPromises);

        const developers = companies
            .filter((c) => c?.developer)
            .map((c) => c?.name);
        const publishers = companies
            .filter((c) => c && !c.developer)
            .map((c) => c?.name);

        companiesData.developer = developers.join(', ') || '';
        companiesData.publisher = publishers.join(', ') || '';

        return companiesData;
    }

    async getGameById(gameId: string): Promise<{
        game: schema.Game | null;
        message: string;
    }> {
        const gameInDb = await this.findGameInDatabase(gameId);

        if (gameInDb.length === 0) {
            // GET GAME DATA FROM IGDB
            const igdbResponse = await igdbFetch({
                url: 'https://api.igdb.com/v4/games',
                body: `fields name,summary,release_dates,cover,involved_companies,first_release_date,slug,genres;
                        limit 1;
                        where id =  ${gameId};`,
            });
            const igdbGame = (await igdbResponse.json()) as IGDBGame[];
            const noIGDBGameFound = igdbGame.length < 1;

            if (noIGDBGameFound) {
                return {
                    game: null,
                    message: `No games found with ID ${gameId}.`,
                };
            }

            const gameDbId = randomUUID();

            const coverUrl = await this.gameUtilsService.getGameCoverUrl(
                `${igdbGame[0].cover}`,
            );

            if (!coverUrl) return { message: 'No cover found.', game: null };

            // GET GAME PUBLISHER AND DEVELOPER
            const companiesData = await this.getGameCompanies(
                igdbGame[0].involved_companies,
            );

            if (!companiesData) {
                return { message: 'No company data found.', game: null };
            }

            // GET GAME RELEASE DATE IN ISO FORMAT
            const gameReleaseDate = this.gameUtilsService.getReleaseDate(
                igdbGame[0].first_release_date,
            );

            if (!gameReleaseDate)
                return { message: 'No release date found.', game: null };

            // GET GAME GENRES

            const gameObject: schema.NewGame = {
                id: gameDbId,
                coverUrl,
                description: igdbGame[0].summary,
                slug: igdbGame[0].slug,
                igdbId: igdbGame[0].id,
                title: igdbGame[0].name,
                developer: companiesData.developer,
                publisher: companiesData.publisher,
                releaseDate: gameReleaseDate,
            };

            console.log('Final gameObject:', gameObject);

            const insertedGame = await this.db
                .insert(this.gamesTable)
                .values(gameObject)
                .returning();
            console.log('insertGameToDb:', insertedGame[0]);

            await this.gameUtilsService.insertGenres(
                igdbGame[0].genres,
                gameDbId,
            );
            return {
                game: insertedGame[0],
                message: `Game with ID ${gameId} added to database.`,
            };
        }

        return {
            game: gameInDb[0],
            message: `Game with ID ${gameId} already exists in Database.`,
        };
    }

    async getGameSearchSuggestions(
        gameName: string,
    ): Promise<{ games: { igdbId: number; name: string }[]; message: string }> {
        const apiCalls = await Promise.allSettled([
            await this.db
                .select({
                    igdbId: this.gamesTable.igdbId,
                    name: this.gamesTable.title,
                })
                .from(this.gamesTable)
                .where(ilike(this.gamesTable.title, `%${gameName}%`))
                .limit(5),
            await igdbFetch({
                url: 'https://api.igdb.com/v4/games',
                body: `fields name,summary,cover,involved_companies, first_release_date,slug,genres;
                        limit 10;
                        search "${gameName}";
                        where version_parent = null & parent_game = null & version_parent = null;`,
            }).then((res) => res.json()),
        ]);

        const gamesInDb =
            apiCalls[0].status === 'fulfilled' ? apiCalls[0].value : [];
        const igdbGames =
            apiCalls[1].status === 'fulfilled' ? apiCalls[1].value : [];

        if (igdbGames.length === 0) {
            console.log('No games found with name, trying with name fallback');
            const igdbNameFallback = await igdbFetch({
                url: 'https://api.igdb.com/v4/games',
                body: `fields name,summary,cover,involved_companies, first_release_date,slug,genres;
                        limit 10;
                        where name ~ *"${gameName}"* & version_parent = null & parent_game = null & version_parent = null;`,
            }).then((res) => res.json());

            igdbGames.push(...igdbNameFallback);
        }

        const gamesSent = [...gamesInDb];
        const gamesIgdb = igdbGames.map(
            (game: { id: number; name: string }) => ({
                igdbId: game.id,
                name: game.name,
            }),
        );
        gamesSent.push(...gamesIgdb);

        const gameMap = new Map();
        gamesSent.forEach((game) => {
            gameMap.set(game.igdbId, { igdbId: game.igdbId, name: game.name });
        });

        const uniqueGames = Array.from(gameMap.values());

        if (uniqueGames.length === 0) {
            return {
                games: [],
                message: `No games found with name ${gameName}.`,
            };
        }
        return {
            games: uniqueGames,
            message: `Games found with name ${gameName}.`,
        };
    }
}
