import { Inject, Injectable } from '@nestjs/common';
import { igdbFetch } from 'src/utils/igdb.utils';
import {
    GetCoverUrlResponse,
    IGDBGenre,
    IGDBInvolvedCompany,
    IGDBCompany,
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
            (await response.json()) as IGDBInvolvedCompany[];

        if (getInvolvedCompaniesResult.length === 0) {
            console.log('No involved_companies entity found');
            return null;
        }

        const companyObject: { name: string; developer: boolean | null } = {
            name: '',
            developer: null,
        };

        const involvedCompaniesResult = (
            await Promise.all(
                getInvolvedCompaniesResult.map(
                    async (company: IGDBInvolvedCompany) => {
                        const fetchCompany = await igdbFetch({
                            url: 'https://api.igdb.com/v4/companies',
                            body: `limit 1;
                                fields name;
                                where id = ${company.company};`,
                        });
                        const result =
                            (await fetchCompany.json()) as IGDBCompany[];
                        console.log('RESULT!!!!!: ', result);
                        companyObject.name = result[0].name;
                        companyObject.developer = company.developer;

                        return result;
                    },
                ),
            )
        ).flat();

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
        const result = (await response.json()) as IGDBGenre[];
        console.log(result);
        if (result.length === 0) return null;

        const genreValues = result.map((g: IGDBGenre) => ({
            id: randomUUID(),
            name: g.name,
            slug: g.slug,
        }));

        await this.db
            .insert(schema.genres)
            .values(genreValues)
            .onConflictDoNothing({
                target: [schema.genres.name, schema.genres.slug],
            });

        const gameGenreValues = result
            .map((g: IGDBGenre) => {
                const genre = genreValues.find(
                    (genre) => genre.slug === g.slug,
                );
                if (!genre?.id) return null;
                return {
                    id: randomUUID(),
                    gameId: gameId,
                    genreId: genre.id,
                };
            })
            .filter((value) => value !== null);

        await this.db
            .insert(schema.gameGenres)
            .values(gameGenreValues)
            .onConflictDoNothing({
                target: [schema.gameGenres.gameId, schema.gameGenres.genreId],
            });

        return;
    }
}
