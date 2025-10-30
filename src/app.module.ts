import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { GamesModule } from './games/games.module'
import { DbModule } from './db/db.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { AuthModule } from './auth/auth.module'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { GoogleService } from './auth/google/google.service'

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
        LoggerModule.forRoot({
            pinoHttp: {
                transport:
                    process.env.NODE_ENV !== 'production'
                        ? {
                              target: 'pino-pretty',
                              options: {
                                  colorize: true,
                                  translateTime: 'HH:MM:ss',
                                  ignore: 'pid,hostname,req,res,responseTime',
                                  messageFormat: '[{context}] {msg}',
                              },
                          }
                        : undefined,
                autoLogging: false,
                customLogLevel: (req, res, err) => {
                    if (res.statusCode >= 400 && res.statusCode < 500)
                        return 'warn'
                    if (res.statusCode >= 500 || err) return 'error'
                    return 'silent'
                },
            },
        }),
        UserModule,
        GamesModule,
        DbModule,
        AuthModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleService],
})
export class AppModule {}
