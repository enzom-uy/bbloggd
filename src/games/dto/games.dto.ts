import { IsString, MinLength } from 'class-validator';
import { Game } from 'drizzle/schema';

export class GetGameInfoDto {
    @IsString({ message: 'Game name is not a valid string.' })
    @MinLength(2, { message: 'Game name must be at least 2 characters.' })
    game_name: string;
}

export class GetGameByIdResponseDto {
    game: Game;
    message: string;
}
