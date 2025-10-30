import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class GoogleService {
    private readonly scopesAPI: string[]
    private readonly credentialsPath: string
    constructor(
        private configService: ConfigService,
        private readonly logger: PinoLogger,
    ) {}

    async getOAuth2ClientUrl(): Promise<{ url: string }> {
        const authClient = this.getAuthClient()
        return this.getAuthUrl(authClient)
    }

    getAuthClient(): OAuth2Client {
        const authClient = new OAuth2Client({
            clientId: this.configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
            redirectUri: this.configService.get('REDIRECT_URI'),
        })

        return authClient
    }

    getAuthUrl(authClient: OAuth2Client): { url: string } {
        const authorizeUrl = authClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['email', 'profile'],
            prompt: 'consent',
            include_granted_scopes: true,
        })
        return { url: authorizeUrl }
    }

    async getAuthClientData(
        code: string,
    ): Promise<{ email: string; refreshToken: string; accessToken: string }> {
        const authClient = this.getAuthClient()
        const tokenData = await authClient.getToken(code)
        const tokens = tokenData.tokens
        const refreshToken = tokens?.refresh_token || ''
        const accessToken = tokens?.access_token || ''

        authClient.setCredentials(tokens)

        const googleAuth = google.oauth2({
            version: 'v2',
            auth: authClient,
        } as any)

        const googleUserInfo = await googleAuth.userinfo.get()
        const email = googleUserInfo.data.email!
        return { email, refreshToken, accessToken }
    }
}

export interface IGoogleAuthCredentials {
    web: {
        client_id: string
        client_secret: string
        redirect_uri: string
        auth_uri: string
        token_uri: string
        auth_provider_x509_cert_url: string
        javascript_origins: string[]
    }
}
