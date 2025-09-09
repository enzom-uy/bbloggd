import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from 'src/db/db.module';
import * as schema from '../../drizzle/schema';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'crypto';
import { GameUtilsService } from './games-utils.service';
import { igdbFetch } from 'src/utils/igdb.utils';
import { IGDBGetGameResponse } from './types/igdb.types';

@Injectable()
export class GamesService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly gameUtilsService: GameUtilsService,
    ) {}

    private readonly gamesTable = schema.games;

    private async findGameInDatabase(gameId: string) {
        const result = await this.db.execute(
            sql`SELECT * FROM ${this.gamesTable} WHERE ${this.gamesTable.igdbId} = ${gameId}`,
        );
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

    async getGameById(gameId: string) {
        const existingGame = await this.findGameInDatabase(gameId);

        const gameDoesntExistInDb = existingGame.rows.length < 1;

        if (gameDoesntExistInDb) {
            console.log('No games found in db.');

            // GET GAME DATA FROM IGDB
            const igdbResponse = await igdbFetch({
                url: 'https://api.igdb.com/v4/games',
                body: `fields name,summary,release_dates,cover,involved_companies,first_release_date,slug,genres;
                        limit 1;
                        where id =  ${gameId};`,
            });
            const igdbGame =
                (await igdbResponse.json()) as IGDBGetGameResponse[];
            const noIGDBGameFound = igdbGame.length < 1;

            if (noIGDBGameFound) {
                return { message: 'No games found.', query: gameId };
            }

            const gameDbId = randomUUID();

            const coverUrl = await this.gameUtilsService.getGameCoverUrl(
                `${igdbGame[0].cover}`,
            );

            if (!coverUrl) return { message: 'No cover found.' };

            // GET GAME PUBLISHER AND DEVELOPER
            const companiesData = await this.getGameCompanies(
                igdbGame[0].involved_companies,
            );

            if (!companiesData) {
                return { message: 'No company data found.' };
            }

            // GET GAME RELEASE DATE IN ISO FORMAT
            const gameReleaseDate = this.gameUtilsService.getReleaseDate(
                igdbGame[0].first_release_date,
            );

            if (!gameReleaseDate) return { message: 'No release date found.' };

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

            const insertGameToDb = await this.db.execute(
                sql`
                INSERT INTO ${this.gamesTable} (id, title, description, release_date, cover_url, developer, publisher, igdb_id, slug)
                VALUES (${gameObject.id}, ${gameObject.title}, ${gameObject.description}, ${gameObject.releaseDate}, ${gameObject.coverUrl}, ${gameObject.developer}, ${gameObject.publisher}, ${gameObject.igdbId}, ${gameObject.slug})
                RETURNING *
                `,
            );
            console.log('insertGameToDb:', insertGameToDb);

            await this.gameUtilsService.insertGenres(
                igdbGame[0].genres,
                gameDbId,
            );
            return { message: 'Game added to database.' };
        }

        return {
            message: `Searching for games with name: ${gameId}`,
            query: gameId,
        };
    }

    async getGameSearchSuggestions(query: string) {}
}
