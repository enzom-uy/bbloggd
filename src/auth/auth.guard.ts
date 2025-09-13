import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

interface CookieObject {
    [key: string]: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const token = req.headers.authorization;
        const cookies = req.cookies as CookieObject;
        const cookie = cookies?.['better-auth.session_token'];

        const validateSessionResponse = await fetch(
            'http://localhost:4321/api/auth/validate-session',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Cookie: `better-auth.session_token=${cookie}`,
                },
            },
        ).then((res) => res.json() as Promise<{ valid: boolean }>);

        if (!validateSessionResponse.valid) {
            console.log('Request is not authenticated.');
            throw new UnauthorizedException('Invalid session');
        }
        return true;
    }
}
