import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GamesModule } from './games/games.module';

@Module({
    imports: [UserModule, ConfigModule.forRoot(), GamesModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
