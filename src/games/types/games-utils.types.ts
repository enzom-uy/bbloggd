interface GetCoverUrlResponseBody {
    id: string;
    url: string;
}

export type GetCoverUrlResponse = GetCoverUrlResponseBody[] | [];

export interface IGDBInvolvedCompany {
    id: number;
    developer: boolean;
    publisher: boolean;
    company: number;
}

export type GetInvolvedCompaniesResponse = IGDBInvolvedCompany[] | [];

export interface IGDBCompany {
    id: number;
    name: string;
}

export type GetCompanyResponse = IGDBCompany[] | [];

export interface IGDBReleaseDate {
    id: number;
    date: number;
}

export type GetReleaseDateResponse = IGDBReleaseDate[] | [];

export interface IGDBGenre {
    id: number;
    name: string;
    slug: string;
}

export type GetGenresResponse = IGDBGenre[] | [];
