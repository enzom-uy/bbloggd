import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameUtilsService } from './games-utils.service';

@Module({
    controllers: [GamesController],
    providers: [GamesService, GameUtilsService],
})
export class GamesModule {}
