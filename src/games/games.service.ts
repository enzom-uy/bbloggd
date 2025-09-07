import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from 'src/db/db.module';
import * as schema from '../../drizzle/schema';
import { InferSelectModel, sql } from 'drizzle-orm';

type Game = InferSelectModel<typeof schema.games>;

@Injectable()
export class GamesService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: PostgresJsDatabase<typeof schema>,
    ) {}

    // TODO: this
    async searchGames(gameName: string) {
        const gamesTable = schema.games;

        // TODO: check db first
        const result: Game[] = await this.db.execute(
            sql`select * from ${gamesTable} where ${gamesTable.title} like ${'%' + gameName + '%'}`,
        );

        if (result.length < 1) {
            console.log('No games found');
        }

        return {
            message: `Searching for games with name: ${gameName}`,
            query: gameName,
        };
    }
}
