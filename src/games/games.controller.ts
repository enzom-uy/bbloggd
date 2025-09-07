import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { GamesService } from './games.service';
import { GetGameInfoDto } from './dto/getGameInfo.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/search')
  async getGameInfo(@Query() queryParams: GetGameInfoDto) {
    // Ahora puedes acceder al query validado
    return await this.gamesService.searchGames(queryParams.game_name);
  }
}
