import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator'
import { games } from 'drizzle/schema'
import { Transform } from 'class-transformer'

export class GetGameInfoDto {
    @IsString({ message: 'Game name is not a valid string.' })
    @MinLength(2, { message: 'Game name must be at least 2 characters.' })
    game_name: string
}
export class GetGameByIdResponseDto {
    game: typeof games.$inferSelect
    message: string
}

export class GetGamePlatformsQueryParams {
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return undefined
    })
    abbreviated?: boolean
}
