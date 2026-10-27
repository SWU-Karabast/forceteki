import { mintSessionToken, sessionCookie, signInClaims } from '../../../../helpers/server/AuthTokens';
import type { ISeededAccount } from '../../../../helpers/server/FakeDynamoDbService';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import { testIntraserviceSecret, testProfileCaptureSecret } from '../../../../helpers/server/ServerTestEnv';
import type { IServerTestOptions } from '../../../../helpers/server/ServerTestHarness';

const rotatedTokens = { access_token: 'new-access-token', refresh_token: 'rotated-refresh-token', expires_in: 3600 };

interface ILinkRoute {
    site: string;
    path: string;

    /** The stats site's endpoint the game node calls to turn what it was given into a refresh token. */
    outboundUrl: string;

    /** The body the FE server sends. `userId` is the account the link was started from, which only SWUBase carries. */
    body: (userId: string, internalApiKey?: string) => Record<string, unknown>;
    storedToken: (profile: { swuStatsRefreshToken?: string; swubaseRefreshToken?: string }) => string | undefined;
    success: string;
}

/** The two routes the FE server calls, on the user's behalf, to hand the game node a stats-site token. */
const linkRoutes: ILinkRoute[] = [
    {
        site: 'SWUStats',
        path: '/api/link-swustats',
        outboundUrl: 'swustats.net/TCGEngine/APIs/OAuth/token.php',
        body: (_userId, internalApiKey) => ({ swuStatsToken: { refreshToken: 'original-refresh-token' }, internalApiKey }),
        storedToken: (profile) => profile.swuStatsRefreshToken,
        success: 'SWUStats linked successfully',
    },
    {
        site: 'SWUBase',
        path: '/api/link-swubase',
        outboundUrl: 'swubase.com/api/integration/link-confirm',
        body: (userId, internalApiKey) => ({ expectedUserId: userId, linkToken: 'one-time-link-token', internalApiKey }),
        storedToken: (profile) => profile.swubaseRefreshToken,
        success: 'SWUBase linked successfully',
    },
];

/** The user's session, which the FE server forwards with the call. */
const sessionOf = (account: ISeededAccount) => sessionCookie(mintSessionToken(signInClaims(account)));

/**
 * The two credentials that are not a user's session: the key the FE *server* presents when it links a
 * stats-site account (`INTRASERVICE_SECRET`, in the body), and the key behind the profiling endpoint
 * (`PROFILE_CAPTURE_SECRET`, in an `Authorization: api-key` header). Neither is a user, and both would let
 * a caller write to an account or start a CPU profile. The link routes also need the user's own session, which
 * says whose account the token goes on.
 */
describe('Service credentials', function () {
    for (const route of linkRoutes) {
        describe(`${route.path}, used by the FE server to link a ${route.site} account`, function () {
            const options: IServerTestOptions = { database: true };

            serverIntegration(function (contextRef) {
                it('refuses a request with the wrong key, and neither calls the site nor stores anything', async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount();

                    const response = await harness.requestAsync('post', route.path, { cookie: sessionOf(account), body: route.body(account.id, 'not-the-secret') });

                    expect(response.status).toBe(403);
                    expect(response.body).toEqual({ success: false, message: 'Forbidden' });
                    expect(harness.statsHttpClient.requests).toEqual([]);
                    expect(route.storedToken(harness.db.profiles.get(account.id))).toBeUndefined();
                });

                it('refuses a request with no key while a secret is set', async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount();

                    const response = await harness.requestAsync('post', route.path, { cookie: sessionOf(account), body: route.body(account.id) });

                    expect(response.status).toBe(403);
                    expect(harness.statsHttpClient.requests).toEqual([]);
                });

                it('refuses a signed-in user\'s own session in place of the key', async function () {
                    const { harness } = contextRef;
                    const client = harness.createAccountClient();

                    const response = await client.requestAsync('post', route.path, route.body(client.id));

                    expect(response.status).toBe(403);
                    expect(route.storedToken(harness.db.profiles.get(client.id))).toBeUndefined();
                });

                it('refuses the right key with no session, and neither calls the site nor stores anything', async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount();

                    const response = await harness.requestAsync('post', route.path, { body: route.body(account.id, testIntraserviceSecret) });

                    expect(response.status).toBe(401);
                    expect(harness.statsHttpClient.requests).toEqual([]);
                    expect(route.storedToken(harness.db.profiles.get(account.id))).toBeUndefined();
                });

                it('with the right key and the user\'s session, asks the site for a token and stores the one it gets on the account', async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount();
                    harness.statsHttpClient.setResponse(route.outboundUrl, { body: rotatedTokens });

                    const response = await harness.requestAsync('post', route.path, { cookie: sessionOf(account), body: route.body(account.id, testIntraserviceSecret) });

                    expect(response.status).toBe(200);
                    expect(response.body).toEqual({ success: true, message: route.success });
                    expect(harness.statsHttpClient.requestsTo(route.outboundUrl).length).toBe(1);
                    expect(route.storedToken(harness.db.profiles.get(account.id))).toBe('rotated-refresh-token');
                });

                it('stores the token on the account the session belongs to, whatever account id the body names', async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount();
                    const other = harness.db.seedAccount();
                    harness.statsHttpClient.setResponse(route.outboundUrl, { body: rotatedTokens });

                    await harness.requestAsync('post', route.path, {
                        cookie: sessionOf(account),
                        body: { ...route.body(account.id, testIntraserviceSecret), userId: other.id },
                    });

                    expect(route.storedToken(harness.db.profiles.get(account.id))).toBe('rotated-refresh-token');
                    expect(route.storedToken(harness.db.profiles.get(other.id))).toBeUndefined();
                });
            }, options);

            describe('with the secret unset on a development server', function () {
                serverIntegration(function (contextRef) {
                    it('fails, rather than accepting a request that has no key', async function () {
                        const { harness } = contextRef;
                        const account = harness.db.seedAccount();

                        const response = await harness.requestAsync('post', route.path, { cookie: sessionOf(account), body: route.body(account.id) });

                        expect(response.status).toBe(500);
                        expect(response.body.error).toBe('Environment variable INTRASERVICE_SECRET not set');
                        expect(harness.statsHttpClient.requests).toEqual([]);
                    });
                }, { database: true, env: { INTRASERVICE_SECRET: undefined } });
            });
        });
    }

    describe('/api/link-swubase, which also checks the account the link was started from', function () {
        serverIntegration(function (contextRef) {
            it('refuses a session for a different account than the one that started the link', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();
                const starter = harness.db.seedAccount();

                const response = await harness.requestAsync('post', '/api/link-swubase', {
                    cookie: sessionOf(account),
                    body: { expectedUserId: starter.id, linkToken: 'one-time-link-token', internalApiKey: testIntraserviceSecret },
                });

                expect(response.status).toBe(403);
                expect(harness.statsHttpClient.requests).toEqual([]);
                expect(harness.db.profiles.get(account.id).swubaseRefreshToken).toBeUndefined();
                expect(harness.db.profiles.get(starter.id).swubaseRefreshToken).toBeUndefined();
            });
        }, { database: true });
    });

    // `PROFILE_CAPTURE_SECRET` is read once, when `server/env.ts` is first imported, so unlike the secret above
    // it cannot be unset for one spec. Its unset branch (which refuses everything) is therefore not covered here.
    describe('/api/run-profile, which starts a CPU or heap profile', function () {
        const authorization = (value: string) => ({ Authorization: value });

        serverIntegration(function (contextRef) {
            it('refuses a request with no Authorization header', async function () {
                const response = await contextRef.harness.requestAsync('post', '/api/run-profile', { body: { type: 'cpu', durationSeconds: 1 } });

                expect(response.status).toBe(401);
                expect(response.body).toEqual({ success: false, message: 'Unauthorized - Missing or invalid Authorization header' });
            });

            it('refuses an Authorization header that is not an api-key', async function () {
                const response = await contextRef.harness.requestAsync('post', '/api/run-profile', {
                    headers: authorization(`Bearer ${testProfileCaptureSecret}`),
                    body: { type: 'cpu', durationSeconds: 1 },
                });

                expect(response.status).toBe(401);
            });

            it('refuses the key when it is sent in the body instead of the header', async function () {
                const response = await contextRef.harness.requestAsync('post', '/api/run-profile', {
                    body: { type: 'cpu', durationSeconds: 1, apiKey: testProfileCaptureSecret },
                });

                expect(response.status).toBe(401);
            });

            it('refuses a key that is wrong', async function () {
                const response = await contextRef.harness.requestAsync('post', '/api/run-profile', {
                    headers: authorization('api-key not-the-secret'),
                    body: { type: 'cpu', durationSeconds: 1 },
                });

                expect(response.status).toBe(403);
                expect(response.body).toEqual({ success: false, message: 'Forbidden' });
            });

            it('lets the right key through to the endpoint\'s own validation, without starting a profile', async function () {
                const response = await contextRef.harness.requestAsync('post', '/api/run-profile', {
                    headers: authorization(`api-key ${testProfileCaptureSecret}`),
                    body: { type: 'neither', durationSeconds: 1 },
                });

                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Invalid type parameter. Must be "cpu" or "heap"');
            });
        }, { database: true });
    });
});
