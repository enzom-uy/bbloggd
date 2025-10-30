import 'dotenv/config'

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true })
    app.useGlobalInterceptors(new LoggerErrorInterceptor())
    app.useLogger(app.get(Logger))
    app.setGlobalPrefix('api')

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    app.enableCors({
        origin: 'http://localhost:4321',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    })

    app.use(cookieParser())

    const port = process.env.PORT ?? 3000
    await app.listen(port)

    const logger = app.get(Logger)
    logger.log(`Server is running on port ${port}`)
}
void bootstrap()
