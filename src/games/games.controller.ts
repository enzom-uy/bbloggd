import {
    Controller,
    Get,
    Body,
    Query,
    Param,
    NotFoundException,
    InternalServerErrorException,
    Req,
    UnauthorizedException,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGameByIdResponseDto, GetGameInfoDto } from './dto/games.dto';
import { Response, Request } from 'express';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/search')
    async getGamesSuggestions(
        @Query() queryParams: GetGameInfoDto,
        @Req() req: Request,
    ) {
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

    @Get('/:id')
    async getGameById(
        @Param('id') gameId: string,
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
}
