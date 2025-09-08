interface GetCoverUrlResponseBody {
    id: string;
    url: string;
}

export type GetCoverUrlResponse = GetCoverUrlResponseBody[] | [];

interface GetInvolvedCompaniesResponseBody {
    id: number;
    developer: boolean;
    publisher: boolean;
    company: number;
}

export type GetInvolvedCompaniesResponse =
    | GetInvolvedCompaniesResponseBody[]
    | [];

interface GetCompanyResponseBody {
    id: number;
    name: string;
}

export type GetCompanyResponse = GetCompanyResponseBody[] | [];

interface GetReleaseDateResponseBody {
    id: number;
    date: number;
}

export type GetReleaseDateResponse = GetReleaseDateResponseBody[] | [];

export interface GetGenresResponseBody {
    id: number;
    name: string;
    slug: string;
}

export type GetGenresResponse = GetGenresResponseBody[] | [];
