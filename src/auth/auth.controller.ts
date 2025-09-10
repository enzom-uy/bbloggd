import { Controller, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // TODO: implement getAuthToken controller
    @Get('token')
    getAuthToken(@Req() req) {
        return this.authService.getAuthToken;
    }
}
