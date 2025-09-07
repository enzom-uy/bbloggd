import { Injectable } from '@nestjs/common';

@Injectable()
export class GameUtilsService {
    // TODO: implement
    async getGameCoverUrl(coverId: string): Promise<string | null> {
        if (!coverId) return null;
        return null;
    }

    // TODO: implement
    async getReleaseDate(): Promise<any> {}
}
