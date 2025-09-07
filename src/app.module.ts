import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GamesModule } from './games/games.module';
import { DbModule } from './db/db.module';

@Module({
    imports: [
        UserModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        GamesModule,
        DbModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
