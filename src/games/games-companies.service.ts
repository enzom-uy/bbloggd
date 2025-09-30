import { Injectable } from '@nestjs/common'
import { igdbFetch } from 'src/utils/igdb.utils'
import { IGDBCompany, IGDBInvolvedCompany } from './types/games-utils.types'

@Injectable()
export class GamesCompaniesService {
    constructor() {}

    async getGameInvolvedCompanies(companyId: string) {
        const response = await igdbFetch({
            url: 'https://api.igdb.com/v4/involved_companies',
            body: `limit 1;
                    fields developer,publisher, company;
                   where id = ${companyId} & supporting = false;`,
        })

        if (response.status !== 200) return null

        const getInvolvedCompaniesResult =
            (await response.json()) as IGDBInvolvedCompany[]

        if (getInvolvedCompaniesResult.length === 0) {
            console.log('No involved_companies entity found')
            return null
        }

        const companyObject: { name: string; developer: boolean | null } = {
            name: '',
            developer: null,
        }

        const involvedCompaniesResult = (
            await Promise.all(
                getInvolvedCompaniesResult.map(
                    async (company: IGDBInvolvedCompany) => {
                        const fetchCompany = await igdbFetch({
                            url: 'https://api.igdb.com/v4/companies',
                            body: `limit 1;
                                fields name;
                                where id = ${company.company};`,
                        })
                        const result =
                            (await fetchCompany.json()) as IGDBCompany[]
                        companyObject.name = result[0].name
                        companyObject.developer = company.developer

                        return result
                    },
                ),
            )
        ).flat()
        return companyObject
    }
}
