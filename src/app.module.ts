import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { GamesModule } from './games/games.module'
import { DbModule } from './db/db.module'
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000,
                    limit: 30,
                },
            ],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        GamesModule,
        DbModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
