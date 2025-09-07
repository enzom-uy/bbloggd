export const igdbFetch = async ({
    url,
    body,
}: {
    url: string;
    body: string;
}): Promise<Response> => {
    const response = await fetch(url, {
        method: 'POST',
        body,
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID!,
            Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN!}`,
        },
    });

    return response;
};
