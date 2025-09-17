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
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGameByIdResponseDto, GetGameInfoDto } from './dto/games.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/search')
    async getGamesSuggestions(@Query() queryParams: GetGameInfoDto) {
        const gameName = queryParams.game_name;

        if (gameName.trim().length < 2) {
            throw new UnauthorizedException(
                'Game name must be at least 2 characters long',
            );
        }

        try {
            const { games, message } =
                await this.gamesService.getGameSearchSuggestions(gameName);
            if (!games) {
                throw new NotFoundException(
                    message || `Game ${gameName} not found`,
                );
            }
            return {
                message,
                games,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error in getGamesSuggestions:', error);
            throw new InternalServerErrorException('Error retrieving games');
        }
    }

    @Get('/:igdbId')
    async getGameById(
        @Param('igdbId') gameId: string,
    ): Promise<GetGameByIdResponseDto> {
        try {
            const { game, message } =
                await this.gamesService.getGameById(gameId);
            if (!game) {
                throw new NotFoundException(
                    message || `Game with id ${gameId} not found`,
                );
            }
            return {
                message,
                game,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(
                    'Game not found.',
                    HttpStatus.NOT_FOUND,
                );
            }
            console.error('Error in getGameById:', error);
            throw new InternalServerErrorException('Error retrieving game');
        }
    }

    @Get('/:igdbId/stats')
    async getGameStats(@Param('igdbId') gameIgdbId: string) {
        console.log(
            '[Stats Endpoint] Trying to fetch stats for game: ',
            gameIgdbId,
        );
        try {
            const game = await this.gamesService.getGameById(gameIgdbId);
            if (!game.game) {
                throw new NotFoundException(
                    `Game with id ${gameIgdbId} not found`,
                );
            }
            // TODO: implement getGameStats method
            const stats = await this.gamesService.getGameStats(game.game.id);

            if (!stats) {
                throw new NotFoundException('No stats found for game');
            }

            console.log('[Stats Endpoint] Stats from controller: ', stats);

            return stats;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(
                    'Game not found.',
                    HttpStatus.NOT_FOUND,
                );
            }
            console.error('Error in getGameStats:', error);
            throw new InternalServerErrorException('Error retrieving game');
        }
    }

    @Get('/:igdbId/hltb')
    async getGameHltbStats(@Param('igdbId') gameIgdbId: string) {
        console.log(
            '[HLTB Endpoint] Trying to fetch HLTB data for game: ',
            gameIgdbId,
        );
        try {
            const { game, message } =
                await this.gamesService.getGameById(gameIgdbId);
            if (!game) {
                throw new NotFoundException(
                    message || `Game with id ${gameIgdbId} not found`,
                );
            }

            const hltbData = await this.gamesService.getGameHltbStats({
                gameName: game.title,
                gameId: game.id,
            });

            if (!hltbData) {
                throw new NotFoundException('No HLTB data found for game');
            }

            console.log(
                '[HLTB Endpoint] HLTB Data from controller: ',
                hltbData,
            );

            return hltbData;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new HttpException(
                    'Game not found.',
                    HttpStatus.NOT_FOUND,
                );
            }
            console.error('Error in getGameHltbStats:', error);
            throw new InternalServerErrorException('Error retrieving game');
        }
    }
}
