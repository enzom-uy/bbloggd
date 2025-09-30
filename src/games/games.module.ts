import { Module } from '@nestjs/common'
import { GamesService } from './games.service'
import { GamesController } from './games.controller'
import { GameUtilsService } from './games-utils.service'
import { GamePlatformsService } from './games-platforms.service'
import { GamesCompaniesService } from './games-companies.service'

@Module({
    controllers: [GamesController],
    providers: [
        GamesService,
        GameUtilsService,
        GamePlatformsService,
        GamesCompaniesService,
    ],
})
export class GamesModule {}
