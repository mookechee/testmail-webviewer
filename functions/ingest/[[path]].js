export async function onRequest(context) {
    const url = new URL(context.request.url);
    const pathname = url.pathname.replace(/^\/ingest/, '');
    const search = url.search;

    const posthogUrl = `https://eu.i.posthog.com${pathname}${search}`;

    const headers = new Headers(context.request.headers);
    headers.set('host', 'eu.i.posthog.com');

    const response = await fetch(posthogUrl, {
        method: context.request.method,
        headers: headers,
        body: context.request.method === 'GET' ? undefined : context.request.body
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
    });
}
