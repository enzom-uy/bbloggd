export interface IGDBHeaders {
    date: string;
    'content-type': string;
    'transfer-encoding': string;
    connection: string;
    'content-encoding': string;
    'x-amzn-remapped-date': string;
    'x-amzn-requestid': string;
    'x-amzn-remapped-content-length': string;
    'x-pool': string;
    'x-amz-apigw-id': string;
    'x-count': string;
    'x-cache': string;
    via: string;
    'x-amz-cf-pop': string;
    'x-amz-cf-id': string;
    'cf-cache-status': string;
    'set-cookie': string;
    'strict-transport-security': string;
    'x-content-type-options': string;
    server: string;
    'cf-ray': string;
    'alt-svc': string;
}

export interface IGDBResponse {
    status: number;
    statusText: string;
    headers: IGDBHeaders;
    body: ReadableStream<Uint8Array>;
    bodyUsed: boolean;
    ok: boolean;
    redirected: boolean;
    type: 'basic' | 'cors' | 'default' | 'error' | 'opaque' | 'opaqueredirect';
    url: string;
}

export interface IGDBApiResponse extends Omit<IGDBResponse, 'body'> {
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    clone(): IGDBApiResponse;
}

export interface IGDBGetGameResponse {
    id: number;
    cover: number;
    name: string;
    release_dates: number[];
    summary: string;
}
