import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DATABASE_CONNECTION } from 'src/db/db.module'
import * as schema from 'drizzle/schema'
import { igdbFetch } from 'src/utils/igdb.utils'
import { IGDBPlatform } from './types/games-utils.types'
import { randomUUID } from 'crypto'
import { eq, inArray } from 'drizzle-orm'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class GamePlatformsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(GamePlatformsService.name)
    }

    getIgdbPlatforms(platforms: number[]) {
        const platformsData = platforms.map(async (platformId) => {
            const response = await igdbFetch({
                url: 'https://api.igdb.com/v4/platforms',
                body: `fields abbreviation,name,slug;
                        where id = ${platformId};`,
            })
            if (!response.ok) {
                throw new Error('Failed to fetch platforms')
            }
            const result = (await response.json()) as IGDBPlatform[]
            return result[0]
        })
        return platformsData
    }

    async insertPlatforms(igdbPlatforms: IGDBPlatform[]) {
        const insertedPlatforms = await this.db
            .insert(schema.platforms)
            .values(
                igdbPlatforms.map(
                    (p: IGDBPlatform) =>
                        ({
                            id: randomUUID(),
                            abbreviation: p.abbreviation ?? '',
                            name: p.name,
                            slug: p.slug,
                        }) as typeof schema.platforms.$inferInsert,
                ),
            )
            .onConflictDoNothing()
            .returning()
        return insertedPlatforms
    }

    async insertGamePlatforms(
        insertedPlatforms: (typeof schema.platforms.$inferSelect)[],
        gameId: string,
        igdbId: number,
    ) {
        await this.db.insert(schema.gamePlatforms).values(
            insertedPlatforms.map(
                (p) =>
                    ({
                        id: randomUUID(),
                        gameId: gameId,
                        platformId: p.id,
                        igdbId,
                    }) as typeof schema.gamePlatforms.$inferInsert,
            ),
        )
    }

    async getGamePlatforms(igdbId: number, abbreviated: boolean) {
        const gamePlatforms = await this.db
            .select()
            .from(schema.gamePlatforms)
            .where(eq(schema.gamePlatforms.igdbId, igdbId))
        this.logger.info({ abbreviated }, 'Get game platforms request')

        const platformsData = await this.db
            .select(
                abbreviated
                    ? {
                          id: schema.platforms.id,
                          slug: schema.platforms.slug,
                          abbreviation: schema.platforms.abbreviation,
                      }
                    : {
                          id: schema.platforms.id,
                          slug: schema.platforms.slug,
                          name: schema.platforms.name,
                      },
            )
            .from(schema.platforms)
            .where(
                inArray(
                    schema.platforms.id,
                    gamePlatforms.map((gp) => gp.platformId),
                ),
            )

        this.logger.info(
            { gamePlatforms, platformsData },
            'Game platforms fetched',
        )

        return platformsData
    }
}
