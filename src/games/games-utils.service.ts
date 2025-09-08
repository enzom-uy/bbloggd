import { Inject, Injectable } from '@nestjs/common';
import { igdbFetch } from 'src/utils/igdb.utils';
import {
    GetCompanyResponse,
    GetCoverUrlResponse,
    GetGenresResponse,
    GetGenresResponseBody,
    GetInvolvedCompaniesResponse,
} from './types/games-utils.types';
import * as schema from '../../drizzle/schema';
import { DateTime } from 'luxon';
import { DATABASE_CONNECTION } from 'src/db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class GameUtilsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) {}
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

        const formattedUrl = `https:${result[0].url.replace('t_thumb', `t_1080p`)}`;
        return formattedUrl;
    }

    getReleaseDate(igdbDate: number): string | null {
        if (!igdbDate) return null;

        const parsedDate = DateTime.fromSeconds(igdbDate).toISO();
        return parsedDate;
    }

    async getInvolvedCompanies(
        companyId: string,
    ): Promise<{ name: string; developer: boolean | null } | null> {
        if (!companyId) return null;
        console.log('Company ID que llega al service utils: ', companyId);

        const response = await igdbFetch({
            url: 'https://api.igdb.com/v4/involved_companies',
            body: `limit 1;
                    fields developer,publisher, company;
                   where id = ${companyId} & supporting = false;`,
        });

        if (response.status !== 200) return null;

        const getInvolvedCompaniesResult =
            (await response.json()) as GetInvolvedCompaniesResponse;

        if (getInvolvedCompaniesResult.length === 0) {
            console.log('No involved_companies entity found');
            return null;
        }

        const companyObject: { name: string; developer: boolean | null } = {
            name: '',
            developer: null,
        };

        for (const company of getInvolvedCompaniesResult) {
            const fetchCompany = await igdbFetch({
                url: 'https://api.igdb.com/v4/companies',
                body: `limit 1;
                        fields name;
                        where id = ${company.company};`,
            });

            if (fetchCompany.status !== 200) return null;

            const companyResult =
                (await fetchCompany.json()) as GetCompanyResponse;

            if (companyResult.length === 0) {
                console.log('No company entity found');
                break;
            }

            companyObject.name = companyResult[0].name;
            companyObject.developer =
                typeof company.developer === 'boolean'
                    ? company.developer
                    : null;
        }

        return companyObject;
    }

    async insertGenres(genreIds: number[], gameId: string) {
        if (!genreIds) return null;

        const response = await igdbFetch({
            url: 'https://api.igdb.com/v4/genres',
            body: `fields name, slug;
       where id = (${genreIds.join(',')});`,
        });

        if (response.status !== 200) return null;
        const result = (await response.json()) as GetGenresResponse;
        console.log(result);
        if (result.length === 0) return null;

        const genreValues = result.map(
            (g: GetGenresResponseBody) =>
                sql`(${randomUUID()}, ${g.name}, ${g.slug})`,
        );

        await this.db.execute(
            sql`
            INSERT INTO ${schema.genres} (id, name, slug)
            VALUES ${sql.join(genreValues, sql`, `)}
            ON CONFLICT ON CONSTRAINT genres_name_slug_unique DO NOTHING
          `,
        );

        const gameGenreInserts = result.map((g: GetGenresResponseBody) => {
            return sql`(${randomUUID()}, ${gameId}, (SELECT id FROM ${schema.genres} WHERE name = ${g.name}))`;
        });

        await this.db.execute(
            sql`
        INSERT INTO ${schema.gameGenres} (id, game_id, genre_id)
        VALUES ${sql.join(gameGenreInserts, sql`, `)}
        ON CONFLICT ON CONSTRAINT game_genres_game_genre_unique DO NOTHING
        `,
        );

        return;
    }
}
