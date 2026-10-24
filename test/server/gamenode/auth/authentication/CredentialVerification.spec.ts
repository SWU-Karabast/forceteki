import {
    badSessionTokens,
    mintSessionToken,
    secureSessionCookieName,
    sessionCookie,
    sessionCookieName,
    signInClaims,
    syncedClaims,
    withoutClaim,
} from '../../../../helpers/server/AuthTokens';
import type { ISignInIdentity } from '../../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';

/**
 * An identity with no account yet, so that a token for it which is wrongly accepted shows up as an account
 * the server went on to create.
 */
const newcomer: ISignInIdentity = { username: 'Mallory', provider: 'discord', providerId: '666', email: 'mallory@example.test' };

/** What the FE sends once it has synced: its own copy of the profile, marked authenticated. */
const syncedUser = { id: 'client-supplied-id', username: 'Mallory', authenticated: true };

const authenticationFailed = { success: false, message: 'Authentication failed' };

/** `POST /api/get-user` with exactly this token and body; the body of the FE's first request of a session is empty. */
async function getUserAsync(harness: ServerTestHarness, token: string, body: Record<string, unknown> = {}, cookieName = sessionCookieName) {
    return await harness.requestAsync('post', '/api/get-user', { cookie: sessionCookie(token, cookieName), body });
}

function expectNothingStored(harness: ServerTestHarness): void {
    expect(harness.db.profiles.size).withContext('profiles')
        .toBe(0);
    expect(harness.db.oauthLinks.size).withContext('OAuth links')
        .toBe(0);
    expect(harness.db.emailLinks.size).withContext('email links')
        .toBe(0);
    expect(harness.db.usernameLinks.size).withContext('username links')
        .toBe(0);
}

/**
 * How the server decides a session token is genuine, through both ways in: the API (`authMiddleware`) and
 * the socket handshake (`GameServer.authenticateSocketAsync`). The server has two ways of trusting a token -
 * as the FE's already-synced profile (needs a `userId` claim) or as the key to an account it looks up
 * (needs the sign-in claims) - and each has to refuse every kind of bad token on both transports.
 */
describe('Credential verification', function () {
    describe('a session token the server must refuse', function () {
        serverIntegration(function (contextRef) {
            const firstRequestTokens = badSessionTokens(signInClaims(newcomer));
            const syncedTokens = badSessionTokens(syncedClaims(newcomer, 'mallory-account'));

            for (const { description, token } of firstRequestTokens) {
                it(`on the API's first request of a session: ${description}`, async function () {
                    const { harness } = contextRef;

                    const response = await getUserAsync(harness, token);

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });

                it(`on a socket's first connection of a session: ${description}`, async function () {
                    const { harness } = contextRef;
                    const client = harness.createClient();

                    const result = await client.attemptConnectAsync({ token });

                    expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                    expectNothingStored(harness);
                });
            }

            for (const { description, token } of syncedTokens) {
                it(`on a synced API request: ${description}`, async function () {
                    const response = await getUserAsync(contextRef.harness, token, { user: syncedUser });

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                });

                it(`on a synced socket connection: ${description}`, async function () {
                    const client = contextRef.harness.createClient();

                    const result = await client.attemptConnectAsync({ token, user: syncedUser });

                    expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                });
            }
        }, { database: true });
    });

    describe('a validly signed token that lacks a claim the server needs', function () {
        serverIntegration(function (contextRef) {
            it('is refused when synced but without the userId the FE adds after its first sync', async function () {
                const token = mintSessionToken(signInClaims(newcomer));

                const response = await getUserAsync(contextRef.harness, token, { user: syncedUser });

                expect(response.status).toBe(401);
                expect(response.body).toEqual(authenticationFailed);
            });

            it('is refused on a socket when synced but without the userId', async function () {
                const client = contextRef.harness.createClient();

                const result = await client.attemptConnectAsync({ token: mintSessionToken(signInClaims(newcomer)), user: syncedUser });

                expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
            });

            it('is refused on a first request without the id claim, and nothing is stored', async function () {
                const { harness } = contextRef;

                const response = await getUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), 'id')));

                expect(response.status).toBe(401);
                expect(response.body).toEqual(authenticationFailed);
                expectNothingStored(harness);
            });

            it('is refused on a first request without the name claim, and nothing is stored', async function () {
                const { harness } = contextRef;

                const response = await getUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), 'name')));

                expect(response.status).toBe(401);
                expect(response.body).toEqual(authenticationFailed);
                expectNothingStored(harness);
            });

            // TODO: cover a first sign-in whose token has no `email` claim. It is refused, but only after the profile
            // and two of the identity links have been written, so a retry finds a half-made account. Decide whether it
            // should be refused before anything is written (as the `id` and `name` cases above are), then assert that.
        }, { database: true });
    });

    describe('the session cookie', function () {
        serverIntegration(function (contextRef) {
            it(`is read from ${sessionCookieName}`, async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();

                const response = await getUserAsync(harness, mintSessionToken(signInClaims(account)));

                expect(response.status).toBe(200);
                expect(response.body.user.id).toBe(account.id);
            });

            it(`is read from ${secureSessionCookieName}, the name the FE's cookie has behind HTTPS`, async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();

                const response = await getUserAsync(harness, mintSessionToken(signInClaims(account)), {}, secureSessionCookieName);

                expect(response.status).toBe(200);
                expect(response.body.user.id).toBe(account.id);
            });

            it('is taken from the secure cookie when both are present', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();
                const valid = mintSessionToken(signInClaims(account));
                const invalid = 'not.a.jwt';

                const secureIsValid = await harness.requestAsync('post', '/api/get-user', {
                    cookie: `${secureSessionCookieName}=${valid}; ${sessionCookieName}=${invalid}`,
                });
                const plainIsValid = await harness.requestAsync('post', '/api/get-user', {
                    cookie: `${secureSessionCookieName}=${invalid}; ${sessionCookieName}=${valid}`,
                });

                expect(secureIsValid.status).toBe(200);
                expect(plainIsValid.status).toBe(401);
            });
        }, { database: true });
    });

    describe('which identity a request ends up with', function () {
        serverIntegration(function (contextRef) {
            it('is the id in the token, not the one the request claims, over the API', async function () {
                const token = mintSessionToken({ userId: 'the-token-id' });

                const response = await getUserAsync(contextRef.harness, token, { user: { ...syncedUser, id: 'the-claimed-id' } });

                expect(response.status).toBe(200);
                expect(response.body.user.id).toBe('the-token-id');
            });

            it('is the id in the token, not the one the handshake claims, on a socket', async function () {
                const client = contextRef.harness.createClient({ authenticated: true });

                await client.connectAsync({ user: { ...client.userPayload(), id: 'the-claimed-id' } });

                expect(client.socket.data.user.getId()).toBe(client.id);
            });

            it('comes from the database when a socket has a token and a profile that is not marked authenticated', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });
                const client = harness.createAccountClient(account);

                await client.connectAsync({ user: { id: account.id, username: 'ClaimedName' } });

                expect(client.socket.data.user.getUsername()).toBe('StoredName');
                expect(harness.db.loggedInUserIds).toEqual([account.id]);
            });
        }, { database: true });
    });

    describe('the local dev test users', function () {
        const devUser = { id: 'exe66', username: 'Dev One' };

        describe('on a development server', function () {
            serverIntegration(function (contextRef) {
                it('rejects their fixed ids without authentication over the API', async function () {
                    const response = await contextRef.harness.requestAsync('post', '/api/get-user', { body: { user: devUser } });

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                });

                it('rejects their fixed ids without authentication on a socket', async function () {
                    const result = await contextRef.harness.createClient().attemptConnectAsync({ user: devUser });

                    expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                });
            }, { database: true });
        });

        describe('on a production-like server', function () {
            serverIntegration(function (contextRef) {
                it('are refused over the API, as ids that are not UUIDs', async function () {
                    const response = await contextRef.harness.requestAsync('post', '/api/get-user', { body: { user: devUser } });

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                });

                it('are refused on a socket', async function () {
                    const result = await contextRef.harness.createClient().attemptConnectAsync({ user: devUser });

                    expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                });
            }, { database: true, env: { ENVIRONMENT: 'production' } });
        });
    });
});
