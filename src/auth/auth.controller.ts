import { Controller, Get, Query, Redirect } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PinoLogger } from 'nestjs-pino'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: PinoLogger,
    ) {}

    @Get('google')
    @Redirect()
    async googleAuth(): Promise<{ url: string }> {
        return this.authService.googleAuth()
    }

    @Get('google/callback')
    @Redirect()
    async googleAuthCallback(
        @Query('code') code: string,
    ): Promise<{ url: string }> {
        const { email, refreshToken, accessToken } =
            await this.authService.getAuthClientData(code)

        this.logger.info(
            { email, refreshToken, accessToken },
            'Login with google data',
        )

        // TODO: Additional sign-in logic
        return { url: 'http://localhost:3000/api/auth/signed-in' }
    }

    @Get('signed-in')
    signedIn(): { signedIn: boolean } {
        return { signedIn: true }
    }
}
