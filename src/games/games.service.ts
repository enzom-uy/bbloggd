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

    // TODO: this
    async searchGames(gameName: string) {
        const gamesTable = schema.games;

        const result = await this.db.execute(
            sql`SELECT * FROM ${gamesTable} WHERE ${gamesTable.title} LIKE ${'%' + gameName + '%'}`,
        );

        const doesntExistInDb = result.rows.length < 1;

        if (doesntExistInDb) {
            console.log('No games found in db.');

            // TODO: remember to change the fields to the ones you actually want and update typescript interface :)
            // Also check how to get release dates properly (use stalker 2 for testing heh)
            const igdbResponse = await igdbFetch({
                url: 'https://api.igdb.com/v4/games',
                body: `fields name,summary,release_dates,cover,involved_companies;
                        limit 1;
                        search "${gameName}";`,
            });

            if (igdbResponse.status === 200) {
                const igdbGames =
                    (await igdbResponse.json()) as IGDBGetGameResponse[];

                if (igdbGames.length < 1) {
                    return { message: 'No games found.' };
                }

                const uuid = randomUUID();
                const coverUrl = await this.gameUtilsService.getGameCoverUrl(
                    `${igdbGames[0].cover}`,
                );

                if (!coverUrl) return { message: 'No cover found.' };

                console.log('coverUrl:', coverUrl);

                // TODO: implement
                // for (const game of igdbGames) {
                //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
                //     const insertGameToDb = await this.db.execute(
                //         sql`INSERT INTO ${gamesTable}
                //             (id, title, description, releaseDate, coverUrl, developer, publisher, igdbId)
                //             VALUES
                //             (${uuid}, )
                //         `,
                //     );
                // }
            }

            return {
                message: 'No games found in db',
                query: gameName,
            };
        }

        return {
            message: `Searching for games with name: ${gameName}`,
            query: gameName,
        };
    }
}
