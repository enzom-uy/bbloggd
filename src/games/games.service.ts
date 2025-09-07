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

    async getGameById(gameId: string) {
        const gamesTable = schema.games;

        const result = await this.db.execute(
            sql`SELECT * FROM ${gamesTable} WHERE ${gamesTable.igdbId} = ${gameId}`,
        );

        const gameDoesntExistInDb = result.rows.length < 1;

        if (gameDoesntExistInDb) {
            console.log('No games found in db.');

            // GET GAME DATA FROM IGDB
            // TODO: remember to change the fields to the ones you actually want and update typescript interface :)
            // Also check how to get release dates properly (use stalker 2 for testing heh)
            const igdbResponse = await igdbFetch({
                url: 'https://api.igdb.com/v4/games',
                body: `fields name,summary,release_dates,cover,involved_companies,first_release_date,slug,genres;
                        limit 1;
                        where id =  ${gameId};`,
            });
            const igdbGames =
                (await igdbResponse.json()) as IGDBGetGameResponse[];
            const noIGDBFound = igdbGames.length < 1;

            if (noIGDBFound) {
                return { message: 'No games found.', query: gameId };
            }

            const uuid = randomUUID();

            // GET GAME COVER URL
            // TODO: Use Promise.all to get all the data at once
            const coverUrl = await this.gameUtilsService.getGameCoverUrl(
                `${igdbGames[0].cover}`,
            );

            if (!coverUrl) return { message: 'No cover found.' };

            // GET GAME PUBLISHER AND DEVELOPER
            const companiesData = {
                developer: '',
                publisher: '',
            };

            for (const game of igdbGames) {
                for (const company of game.involved_companies) {
                    const companyData =
                        await this.gameUtilsService.getInvolvedCompanies(
                            `${company}`,
                        );

                    if (!companyData) return { message: 'No company found.' };

                    if (companyData.developer) {
                        companiesData.developer = companyData.name;
                    } else {
                        companiesData.publisher = companyData.name;
                    }
                }
            }

            // GET GAME RELEASE DATE IN ISO FORMAT
            const gameReleaseDate = this.gameUtilsService.getReleaseDate(
                igdbGames[0].first_release_date,
            );

            if (!gameReleaseDate) return { message: 'No release date found.' };

            const gameObject: schema.NewGame = {
                id: uuid,
                coverUrl,
                description: igdbGames[0].summary,
                slug: igdbGames[0].slug,
                igdbId: igdbGames[0].id,
                title: igdbGames[0].name,
                developer: companiesData.developer,
                publisher: companiesData.publisher,
                releaseDate: gameReleaseDate,
            };

            console.log('Final gameObject:', gameObject);

            const insertGameToDb = await this.db.execute(
                sql`
                INSERT INTO ${gamesTable} (id, title, description, release_date, cover_url, developer, publisher, igdb_id)
                VALUES (${gameObject.id}, ${gameObject.title}, ${gameObject.description}, ${gameObject.releaseDate}, ${gameObject.coverUrl}, ${gameObject.developer}, ${gameObject.publisher}, ${gameObject.igdbId})
                RETURNING *
                `,
            );
            console.log('insertGameToDb:', insertGameToDb);
            return { message: 'Game added to database.' };
        }

        return {
            message: `Searching for games with name: ${gameId}`,
            query: gameId,
        };
    }
}
