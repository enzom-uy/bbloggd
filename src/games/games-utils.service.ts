import { Inject, Injectable } from '@nestjs/common'
import { igdbFetch } from 'src/utils/igdb.utils'
import { GetCoverUrlResponse, IGDBGenre } from './types/games-utils.types'
import * as schema from '../../drizzle/schema'
import { DateTime } from 'luxon'
import { DATABASE_CONNECTION } from 'src/db/db.module'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { randomUUID } from 'crypto'
import { inArray } from 'drizzle-orm'
import { GamePlatformsService } from './games-platforms.service'
import { GamesCompaniesService } from './games-companies.service'

@Injectable()
export class GameUtilsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        @Inject(GamePlatformsService)
        private readonly gamePlatformsService: GamePlatformsService,
        @Inject(GamesCompaniesService)
        private readonly gameCompaniesService: GamesCompaniesService,
    ) {}
    async getGameCoverUrl(coverId: string): Promise<string | null> {
        if (!coverId) return null

        const response = await igdbFetch({
            url: 'https://api.igdb.com/v4/covers',
            body: `fields url;
                    limit 1;
                    where id = ${coverId};`,
        })

        if (response.status !== 200) {
            return response.statusText
        }

        const result = (await response.json()) as GetCoverUrlResponse

        if (result.length === 0) return null

        const formattedUrl = `https:${result[0].url.replace('t_thumb', `t_1080p`)}`
        return formattedUrl
    }

    getGameReleaseDate(igdbDate: number): string | null {
        if (!igdbDate) return null

        const parsedDate = DateTime.fromSeconds(igdbDate).toISO()
        return parsedDate
    }

    async getGameInvolvedCompanies(
        companyId: string,
    ): Promise<{ name: string; developer: boolean | null } | null> {
        if (!companyId) return null

        const company =
            await this.gameCompaniesService.getGameInvolvedCompanies(companyId)
        return company
    }

    async insertGenres(genreIds: number[], gameId: string) {
        if (!genreIds) return null

        const response = await igdbFetch({
            url: 'https://api.igdb.com/v4/genres',
            body: `fields name, slug;
       where id = (${genreIds.join(',')});`,
        })

        if (response.status !== 200) return null
        const result = (await response.json()) as IGDBGenre[]
        console.log(result)
        if (result.length === 0) return null

        const genreValues = result.map((g: IGDBGenre) => ({
            id: randomUUID(),
            name: g.name,
            slug: g.slug,
        }))

        await this.db
            .insert(schema.genres)
            .values(genreValues)
            .onConflictDoNothing({
                target: [schema.genres.name, schema.genres.slug],
            })

        const existingGenres = await this.db
            .select({ id: schema.genres.id, slug: schema.genres.slug })
            .from(schema.genres)
            .where(
                inArray(
                    schema.genres.slug,
                    result.map((g) => g.slug),
                ),
            )

        const gameGenreValues = existingGenres.map((genre) => ({
            id: randomUUID(),
            gameId: gameId,
            genreId: genre.id,
        }))

        await this.db
            .insert(schema.gameGenres)
            .values(gameGenreValues)
            .onConflictDoNothing({
                target: [schema.gameGenres.gameId, schema.gameGenres.genreId],
            })

        return
    }

    async insertGameStats(gameId: string) {
        if (!gameId) return null

        console.log('Creating Game_Stats...')

        const insertGameStats = await this.db
            .insert(schema.gameStats)
            .values({
                gameId: gameId,
                avgRating: null,
                reviewsCount: 0,
                backlogCount: 0,
                playingCount: 0,
                playedCount: 0,
                droppedCount: 0,
            })
            .onConflictDoNothing({
                target: [schema.gameStats.gameId],
            })
            .returning()

        console.log(insertGameStats)

        return
    }

    async insertGamePlatforms(
        platforms: number[],
        gameId: string,
        igdbId: number,
    ) {
        if (!platforms || platforms.length === 0) {
            return null
        }

        const platformsData =
            this.gamePlatformsService.getIgdbPlatforms(platforms)

        const platformsPromises = await Promise.all(platformsData)

        const insertedPlatforms =
            await this.gamePlatformsService.insertPlatforms(platformsPromises)

        if (insertedPlatforms.length === 0) {
            return
        }

        await this.gamePlatformsService.insertGamePlatforms(
            insertedPlatforms,
            gameId,
            igdbId,
        )
    }
}
