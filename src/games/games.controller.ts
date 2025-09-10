import {
    Controller,
    Get,
    Body,
    Query,
    Param,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGameByIdResponseDto, GetGameInfoDto } from './dto/games.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    // Route that handles search input autocompletion.
    // Uses queryParam "game_name" to search for games.
    // TODO: implement getGamesSuggestions
    @Get('/search')
    async getGamesSuggestions(@Query() queryParams: GetGameInfoDto) {
        console.log('game_name', queryParams.game_name);
        const gameName = queryParams.game_name;

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

    // Route that handles single game view.
    // Example: http://localhost:3000/games/expedition-33-clair-obscur
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
                throw error;
            }
            console.error('Error in getGameById:', error);
            throw new InternalServerErrorException('Error retrieving game');
        }
    }
}
