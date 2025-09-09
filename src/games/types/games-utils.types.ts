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

export interface IGDBCompany {
    id: number;
    name: string;
}

export interface IGDBReleaseDate {
    id: number;
    date: number;
}

export interface IGDBGenre {
    id: number;
    name: string;
    slug: string;
}
