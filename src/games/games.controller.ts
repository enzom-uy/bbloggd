import { Controller, Get, Body, Query, Param } from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGameInfoDto } from './dto/getGameInfo.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    // Route that handles search input autocompletion.
    // Uses queryParam "game_name" to search for games.
    // TODO: implement getGamesSuggestions
    // @Get('/search')
    // async getGamesSuggestions(@Query() queryParams: GetGameInfoDto) {
    //     return await this.gamesService.searchGames(queryParams.game_name);
    // }

    // Route that handles single game view.
    // Example: http://localhost:3000/games/expedition-33-clair-obscur
    @Get('/:id')
    async getGameById(@Param('id') gameId: string) {
        console.log('GameID es?: ', gameId);
        return await this.gamesService.getGameById(gameId);
    }
}
