import { Controller, Get, Body, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGameInfoDto } from './dto/getGameInfo.dto';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/search')
    async getGameInfo(@Query() queryParams: GetGameInfoDto) {
        return await this.gamesService.searchGames(queryParams.game_name);
    }
}
