import { Injectable } from '@nestjs/common';
import { igdbFetch } from 'src/utils/igdb.utils';
import {
    GetCompanyResponse,
    GetCoverUrlResponse,
    GetInvolvedCompaniesResponse,
} from './types/games-utils.types';

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

        const formattedUrl = `https:${result[0].url.replace('t_thumb', `t_1080p`)}`;
        // Add https to the url
        return formattedUrl;
    }

    // TODO: implement
    async getReleaseDate(): Promise<any> {}

    // TODO: implement
    async getInvolvedCompanies(
        companyId: string,
    ): Promise<{ name: string; developer: boolean }[] | null> {
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

        const companies: Array<{ name: string; developer: boolean }> = []; // Array de objetos

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
                continue; // Continúa con la siguiente compañía en lugar de retornar
            }

            // Agregar la compañía al array en lugar de retornar inmediatamente
            companies.push({
                name: companyResult[0].name,
                developer: company.developer === true,
            });
        }

        console.log('Variable companies al final: ', companies);
        return companies; // Retornar el array completo al final
    }
}
