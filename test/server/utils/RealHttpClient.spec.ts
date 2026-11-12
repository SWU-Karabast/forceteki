import http from 'http';

import { RealHttpClient } from '../../../server/utils/RealHttpClient';

/**
 * Covers the production HTTP client against a real local server.
 *
 * The rest of the suite drives `SwuStatsHandler`/`SwuBaseHandler` through `FakeHttpClient`, so
 * without this the claim that production genuinely reaches the network would rest entirely on a
 * fake. A real loopback server keeps this fast and independent of any external site.
 */
describe('RealHttpClient', function () {
    let server: http.Server;
    let baseUrl: string;
    let client: RealHttpClient;

    beforeEach(async function () {
        client = new RealHttpClient();

        server = http.createServer((req, res) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
                if (req.url === '/not-found') {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'not found' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ method: req.method, receivedBody: body }));
            });
        });

        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const address = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterEach(async function () {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('reaches the real server and returns a usable response for a GET', async function () {
        const response = await client.fetch(`${baseUrl}/some-path`);

        expect(response.ok).toBe(true);
        const payload = await response.json() as { method: string };
        expect(payload.method).toBe('GET');
    });

    it('sends a POST body through to the real server', async function () {
        const response = await client.fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hello: 'world' }),
        });

        const payload = await response.json() as { method: string; receivedBody: string };
        expect(payload.method).toBe('POST');
        expect(payload.receivedBody).toBe('{"hello":"world"}');
    });

    it('surfaces a non-ok response rather than throwing', async function () {
        const response = await client.fetch(`${baseUrl}/not-found`);

        expect(response.ok).toBe(false);
        expect(response.status).toBe(404);
    });
});
