import { Injectable } from '@nestjs/common';
import { igdbFetch } from 'src/utils/igdb.utils';
import { GetCoverUrlResponse } from './types/games-utils.types';

@Injectable()
export class GameUtilsService {
    // TODO: implement
    async getGameCoverUrl(coverId: string): Promise<string | null> {
        if (!coverId) return null;

        console.log('Cover ID que llega al service utils: ', coverId);
        const response = await igdbFetch({
            url: 'https://api.igdb.com/v4/covers',
            body: `fields url;
                    limit 1;
                    where id = ${coverId};`,
        });

        if (response.status !== 200) {
            return response.statusText;
        }

        const result = (await response.json()) as GetCoverUrlResponse;

        if (result.length === 0) return null;

        const urlWithoutSlash = result[0].url.replace('//', '');

        const formattedUrl = urlWithoutSlash.replace('t_thumb', `t_1080p`);
        return formattedUrl;
    }

    // TODO: implement
    async getReleaseDate(): Promise<any> {}
}
