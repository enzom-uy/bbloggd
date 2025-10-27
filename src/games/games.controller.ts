import {
    Controller,
    Get,
    Query,
    Param,
    NotFoundException,
    InternalServerErrorException,
    UnauthorizedException,
    HttpStatus,
    HttpException,
} from '@nestjs/common'
import { GamesService } from './games.service'
import {
    GetGameByIdResponseDto,
    GetGameGenresQueryParams,
    GetGameInfoDto,
    GetGamePlatformsQueryParams,
} from './dto/games.dto'
import { GamePlatformsService } from './games-platforms.service'
import { PinoLogger } from 'nestjs-pino'

@Controller('games')
export class GamesController {
    constructor(
        private readonly gamesService: GamesService,
        private readonly gamePlatformsService: GamePlatformsService,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(GamesController.name)
    }
    @Get('/search')
    async getGamesSuggestions(@Query() queryParams: GetGameInfoDto) {
        const gameName = queryParams.game_name
        this.logger.info({ gameName }, 'Game name from query params')

        if (gameName.trim().length < 2) {
            throw new UnauthorizedException(
                'Game name must be at least 2 characters long',
            )
        }

        try {
            const { games, message } =
                await this.gamesService.getGameSearchSuggestions(gameName)
            if (!games) {
                throw new NotFoundException(
                    message || `Game ${gameName} not found`,
                )
            }
            return {
                message,
                games,
            }
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw error
            }
            this.logger.error({ error }, 'Error in getGamesSuggestions')
            throw new InternalServerErrorException('Error retrieving games')
        }
    }

    @Get('/:igdbId')
    async getGameById(
        @Param('igdbId') gameId: string,
    ): Promise<GetGameByIdResponseDto> {
        try {
            const { game, message } =
                await this.gamesService.getGameById(gameId)
            if (!game) {
                throw new NotFoundException(
                    message || `Game with id ${gameId} not found`,
                )
            }
            return {
                message,
                game,
            }
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw new HttpException('Game not found.', HttpStatus.NOT_FOUND)
            }
            this.logger.error({ error }, 'Error in getGameById')
            throw new InternalServerErrorException('Error retrieving game')
        }
    }

    @Get('/:igdbId/stats')
    async getGameStats(@Param('igdbId') gameIgdbId: string) {
        this.logger.info({ gameIgdbId }, 'Trying to fetch stats for game')
        try {
            const game = await this.gamesService.getGameById(gameIgdbId)
            if (!game.game) {
                throw new NotFoundException(
                    `Game with id ${gameIgdbId} not found`,
                )
            }
            const stats = await this.gamesService.getGameStats(game.game.id)

            if (!stats) {
                throw new NotFoundException('No stats found for game')
            }

            this.logger.info({ stats }, 'Stats from controller')

            return stats
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw new HttpException('Game not found.', HttpStatus.NOT_FOUND)
            }
            this.logger.error({ error }, 'Error in getGameStats')
            throw new InternalServerErrorException('Error retrieving game')
        }
    }

    @Get('/:igdbId/hltb')
    async getGameHltbStats(@Param('igdbId') gameIgdbId: string) {
        this.logger.info({ gameIgdbId }, 'Trying to fetch HLTB data for game')
        try {
            const { game, message } =
                await this.gamesService.getGameById(gameIgdbId)
            if (!game) {
                throw new NotFoundException(
                    message || `Game with id ${gameIgdbId} not found`,
                )
            }

            const hltbData = await this.gamesService.getGameHltbStats({
                gameName: game.title,
                gameId: game.id,
            })

            if (!hltbData) {
                throw new NotFoundException('No HLTB data found for game')
            }

            return hltbData
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw new HttpException('Game not found.', HttpStatus.NOT_FOUND)
            }
            this.logger.error({ error }, 'Error in getGameHltbStats')
            throw new InternalServerErrorException('Error retrieving game')
        }
    }

    @Get('/:igdbId/platforms')
    async getGamePlatforms(
        @Param('igdbId') gameIgdbId: string,
        @Query() queryParams: GetGamePlatformsQueryParams,
    ) {
        this.logger.info({ queryParams }, 'Abbreviated from controller')
        try {
            const platforms = await this.gamePlatformsService.getGamePlatforms(
                Number(gameIgdbId),
                queryParams.abbreviated ?? false,
            )

            if (!platforms) {
                throw new NotFoundException('No platforms found for game')
            }

            this.logger.info({ platforms }, 'Platforms from controller')

            return platforms
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw new HttpException('Game not found.', HttpStatus.NOT_FOUND)
            }
            this.logger.error({ error }, 'Error in getGamePlatforms:')
            throw new InternalServerErrorException(error)
        }
    }

    @Get('/:igdbId/genres')
    async getGameGenres(
        @Param('igdbId') gameIgdbId: string,
        @Query() queryParams: GetGameGenresQueryParams,
    ) {
        this.logger.info({ gameIgdbId }, 'Trying to fetch genres for game')
        try {
            const gameId = queryParams.game_id
            const genres = await this.gamesService.getGameGenres(gameId)
            if (!genres) {
                throw new NotFoundException('No genres found for game')
            }
            this.logger.info({ genres }, 'Genres from controller')

            return genres
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw new HttpException('Game not found.', HttpStatus.NOT_FOUND)
            }
            this.logger.error({ error }, 'Error in getGameGenres:')
            throw new InternalServerErrorException(error)
        }
    }
}
