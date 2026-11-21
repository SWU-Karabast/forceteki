import {
    badSessionTokens,
    mintSessionToken,
    secureSessionCookieName,
    sessionCookie,
    sessionCookieName,
    signInClaims,
    withoutClaim,
} from '../../../../helpers/server/AuthTokens';
import type { ISignInIdentity } from '../../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';
import type { TestClient } from '../../../../helpers/server/TestClient';

/**
 * An identity with no account yet, so that a token for it which is wrongly accepted shows up as an account
 * the server went on to create.
 */
const newcomer: ISignInIdentity = { username: 'Mallory', provider: 'discord', providerId: '666', email: 'mallory@example.test' };

const authenticationFailed = { success: false, message: 'Authentication failed' };
const accountNotFound = { success: false, message: 'Authentication failed', code: 'ACCOUNT_NOT_FOUND' };

/** `POST /api/get-user` with exactly this token and body, as the FE does when it syncs a session. */
async function getUserAsync(harness: ServerTestHarness, token: string, body: Record<string, unknown> = {}, cookieName = sessionCookieName) {
    return await harness.requestAsync('post', '/api/get-user', { cookie: sessionCookie(token, cookieName), body });
}

async function createUserAsync(harness: ServerTestHarness, token: string) {
    return await harness.requestAsync('post', '/api/create-user', { cookie: sessionCookie(token) });
}

/**
 * The users in `client`'s lobby state other than `owner`, as id and username. A client that joins an open lobby by
 * its link is added under the identity its socket resolved to, so this shows who the server took it for.
 */
function joinersSeenBy(client: TestClient, owner: TestClient): { id: string; username: string }[] {
    return client.lobbyState.users
        .filter((user: { id: string }) => user.id !== owner.id)
        .map((user: { id: string; username: string }) => ({ id: user.id, username: user.username }));
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
 * How the server decides a session token is genuine and which account it is for, through every way in: the API
 * (`authMiddleware`), the socket handshake (`GameServer.authenticateSocketAsync`) and account creation. The
 * account comes only from the token's signed provider identity and the server's own records.
 */
describe('Credential verification', function () {
    describe('a session token the server must refuse', function () {
        serverIntegration(function (contextRef) {
            for (const { description, token } of badSessionTokens(signInClaims(newcomer))) {
                it(`on the API: ${description}`, async function () {
                    const { harness } = contextRef;

                    const response = await getUserAsync(harness, token);

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });

                it(`on a socket: ${description}`, async function () {
                    const { harness } = contextRef;
                    const client = harness.createClient();

                    const result = await client.attemptConnectAsync({ token });

                    expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                    expectNothingStored(harness);
                });

                it(`when creating an account: ${description}`, async function () {
                    const { harness } = contextRef;

                    const response = await createUserAsync(harness, token);

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });
            }
        });
    });

    describe('a validly signed token that lacks a claim the server needs', function () {
        serverIntegration(function (contextRef) {
            for (const claim of ['provider', 'providerId'] as const) {
                it(`is refused on the API without the ${claim} claim, and nothing is stored`, async function () {
                    const { harness } = contextRef;

                    const response = await getUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), claim)));

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });

                it(`is refused when creating an account without the ${claim} claim, and nothing is stored`, async function () {
                    const { harness } = contextRef;

                    const response = await createUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), claim)));

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });
            }

            it('is refused when creating an account without the name claim, and nothing is stored', async function () {
                const { harness } = contextRef;

                const response = await createUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), 'name')));

                expect(response.status).toBe(401);
                expect(response.body).toEqual(authenticationFailed);
                expectNothingStored(harness);
            });

            it('is refused when creating an account without the email claim, and nothing is stored', async function () {
                const { harness } = contextRef;

                const response = await createUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), 'email')));

                expect(response.status).toBe(401);
                expect(response.body).toEqual(authenticationFailed);
                expectNothingStored(harness);
            });
        });
    });

    // Sessions issued before the FE recorded whether the email is verified: the owner is asked to sign in again,
    // which issues a token that says.
    describe('a validly signed token that does not say whether its email is verified', function () {
        serverIntegration(function (contextRef) {
            const signInAgain = { success: false, message: 'Authentication failed', code: 'SIGN_IN_AGAIN' };

            it('is refused on the API for an account it is linked to', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();

                const response = await getUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(account), 'emailVerified')));

                expect(response.status).toBe(401);
                expect(response.body).toEqual(signInAgain);
                expect(harness.db.loggedInUserIds).toEqual([]);
            });

            it('is refused when creating an account, and nothing is stored', async function () {
                const { harness } = contextRef;

                const response = await createUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(newcomer), 'emailVerified')));

                expect(response.status).toBe(401);
                expect(response.body).toEqual(signInAgain);
                expectNothingStored(harness);
            });

            it('is refused on a socket', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();

                const result = await harness.createClient().attemptConnectAsync({ token: mintSessionToken(withoutClaim(signInClaims(account), 'emailVerified')) });

                expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
            });
        });
    });

    describe('a token whose email the provider has not verified', function () {
        serverIntegration(function (contextRef) {
            it('is refused on a socket, even for an account it is linked to', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();

                const result = await harness.createClient().attemptConnectAsync({ token: mintSessionToken(signInClaims({ ...account, emailVerified: false })) });

                expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
            });
        });
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
        });
    });

    describe('which account a request ends up with', function () {
        serverIntegration(function (contextRef) {
            it('is the one the token\'s provider identity is linked to, whatever other claims it carries', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });
                const other = harness.db.seedAccount({ username: 'SomeoneElse' });
                const token = mintSessionToken({ ...signInClaims(account), userId: other.id });

                const response = await getUserAsync(harness, token);

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual(jasmine.objectContaining({ id: account.id, username: 'StoredName' }));
            });

            it('is the one the server has on record, not the user data the request carries, over the API', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });
                const other = harness.db.seedAccount();

                const response = await getUserAsync(harness, mintSessionToken(signInClaims(account)), {
                    user: {
                        id: other.id,
                        username: 'ClaimedName',
                        authenticated: true,
                        moderation: null,
                        needsUsernameChange: true,
                        preferences: { gameOptions: { muteChat: true } },
                    },
                });

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual(jasmine.objectContaining({
                    id: account.id,
                    username: 'StoredName',
                    needsUsernameChange: false,
                }));
                expect(response.body.user.preferences.gameOptions.muteChat).toBeFalse();
            });

            it('is the one the server has on record, not the user data the handshake carries, on a socket', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });
                const other = harness.db.seedAccount();
                const client = harness.createAccountClient(account);
                const owner = await harness.openLobbyAsync();

                await client.connectAsync({
                    lobbyId: owner.lobbyId,
                    user: { id: other.id, username: 'ClaimedName', authenticated: true },
                });

                expect(joinersSeenBy(client, owner)).toEqual([{ id: account.id, username: 'StoredName' }]);
            });

            it('does not record a login when a socket connects', async function () {
                const { harness } = contextRef;
                const client = harness.createAccountClient();

                await client.connectAsync();

                expect(harness.db.loggedInUserIds).toEqual([]);
            });

            it('records a login when the session is synced', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();

                await getUserAsync(harness, mintSessionToken(signInClaims(account)));

                expect(harness.db.loggedInUserIds).toEqual([account.id]);
            });
        });
    });

    describe('a valid session whose identity has no account', function () {
        serverIntegration(function (contextRef) {
            const token = mintSessionToken(signInClaims(newcomer));

            it('is told so by the API, and nothing is created', async function () {
                const { harness } = contextRef;

                const response = await getUserAsync(harness, token);

                expect(response.status).toBe(401);
                expect(response.body).toEqual(accountNotFound);
                expectNothingStored(harness);
            });

            it('is refused by routes other than get-user, and nothing is created', async function () {
                const { harness } = contextRef;

                const response = await harness.requestAsync('put', '/api/user/preferences', {
                    cookie: sessionCookie(token),
                    body: { preferences: {} },
                });

                expect(response.status).toBe(401);
                expect(response.body).toEqual(accountNotFound);
                expectNothingStored(harness);
            });

            it('is refused a socket, and nothing is created', async function () {
                const { harness } = contextRef;

                const result = await harness.createClient().attemptConnectAsync({ token });

                expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                expectNothingStored(harness);
            });
        });
    });

    describe('creating an account', function () {
        serverIntegration(function (contextRef) {
            it('makes the account for the token\'s identity, which the API then finds', async function () {
                const { harness } = contextRef;
                const token = mintSessionToken(signInClaims(newcomer));

                const created = await createUserAsync(harness, token);
                const synced = await getUserAsync(harness, token);

                expect(created.status).toBe(200);
                expect(created.body).toEqual({ success: true, user: { id: jasmine.any(String), username: 'Mallory' } });
                expect(synced.status).toBe(200);
                expect(synced.body.user.id).toBe(created.body.user.id);
                expect(harness.db.profiles.size).toBe(1);
            });

            it('returns the existing account when there already is one', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });

                const response = await createUserAsync(harness, mintSessionToken(signInClaims(account)));

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual({ id: account.id, username: 'StoredName' });
                expect(harness.db.profiles.size).toBe(1);
            });

            it('makes a single account when asked more than once at the same time', async function () {
                const { harness } = contextRef;
                const token = mintSessionToken(signInClaims(newcomer));

                // Left alone, each request finishes creating the account before the next one reaches the
                // server, so nothing overlaps. Holding the first creation after its profile write keeps it
                // in progress until the other two have arrived. Their arrival is only visible as calls on
                // the server's user factory, since a request sharing a creation touches nothing else.
                let releaseCreation: () => void;
                const creationHeld = new Promise<void>((resolve) => releaseCreation = resolve);
                const saveProfileAsync = harness.db.saveUserProfileAsync.bind(harness.db);
                const profileWrites = spyOn(harness.db, 'saveUserProfileAsync').and.callFake(async (profile) => {
                    const written = await saveProfileAsync(profile);
                    if (profileWrites.calls.count() === 1) {
                        await creationHeld;
                    }
                    return written;
                });
                const creationRequests = spyOn(harness.server.getUserFactory(), 'createUserFromTokenAsync').and.callThrough();

                const responsesArriving = Promise.all([1, 2, 3].map(async () => await createUserAsync(harness, token)));
                for (let i = 0; i < 50 && creationRequests.calls.count() < 3; i++) {
                    await harness.clock.settlePendingWorkAsync();
                }
                expect(creationRequests).withContext('requests in progress together')
                    .toHaveBeenCalledTimes(3);
                releaseCreation();
                const responses = await responsesArriving;

                expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
                expect(new Set(responses.map((response) => response.body.user.id)).size).toBe(1);
                expect(profileWrites).toHaveBeenCalledTimes(1);
                expect(harness.db.profiles.size).toBe(1);
            });

            it('does not read back the profile it has just written', async function () {
                const { harness } = contextRef;
                const profileReads = spyOn(harness.db, 'getUserProfileAsync').and.callThrough();

                await createUserAsync(harness, mintSessionToken(signInClaims(newcomer)));

                expect(profileReads).not.toHaveBeenCalled();
            });

            it('writes the identity link last, so a failure before it leaves nothing that blocks a retry', async function () {
                const { harness } = contextRef;
                const token = mintSessionToken(signInClaims(newcomer));
                spyOn(harness.db, 'saveEmailLinkAsync').and.rejectWith(new Error('write failed'));

                const failed = await createUserAsync(harness, token);

                expect(failed.status).toBe(401);
                expect(harness.db.oauthLinks.size).toBe(0);
            });

            it('can be retried after a failure, and ends up with one account that can sign in', async function () {
                const { harness } = contextRef;
                const token = mintSessionToken(signInClaims(newcomer));
                const failure = spyOn(harness.db, 'saveOAuthLinkAsync').and.rejectWith(new Error('write failed'));

                const failed = await createUserAsync(harness, token);
                failure.and.callThrough();
                const retried = await createUserAsync(harness, token);
                const synced = await getUserAsync(harness, token);

                expect(failed.status).toBe(401);
                expect(retried.status).toBe(200);
                expect(synced.body.user.id).toBe(retried.body.user.id);
                expect(harness.db.profiles.size).toBe(1);
            });

            it('uses the account another request created for the same identity first, and drops its own', async function () {
                const { harness } = contextRef;
                const winner = harness.db.seedAccount({ provider: 'github', providerId: 'winner', email: 'winner@example.test' });
                spyOn(harness.db, 'saveOAuthLinkAsync').and.callFake(() => {
                    harness.db.oauthLinks.set('discord_666', winner.id);
                    return Promise.reject(Object.assign(new Error('The conditional request failed'), { name: 'ConditionalCheckFailedException' }));
                });

                const response = await createUserAsync(harness, mintSessionToken(signInClaims(newcomer)));

                expect(response.status).toBe(200);
                expect(response.body.user.id).toBe(winner.id);
                expect(harness.db.emailLinks.get('mallory@example.test')).toBe(winner.id);
                expect([...harness.db.usernameLinks].filter((link) => link.startsWith('mallory#'))).toEqual([]);
                // TODO (open finding #10): the profile this request wrote is left behind, though the server
                // means to drop it. Once it is deleted, also expect harness.db.profiles.size to be 1 (the winner).
            });

            it('refuses a request with no session', async function () {
                const response = await contextRef.harness.requestAsync('post', '/api/create-user');

                expect(response.status).toBe(401);
            });

            it('attaches a second provider to the account that has the same email', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ provider: 'discord', providerId: '111', email: 'shared@example.test' });
                const google: ISignInIdentity = { username: 'Whoever', provider: 'google', providerId: '222', email: 'shared@example.test' };

                const response = await createUserAsync(harness, mintSessionToken(signInClaims(google)));

                expect(response.body.user.id).toBe(account.id);
                expect(harness.db.oauthLinks.get('discord_111')).toBe(account.id);
                expect(harness.db.oauthLinks.get('google_222')).toBe(account.id);
                expect(harness.db.profiles.size).toBe(1);
            });
        });
    });

    describe('the local dev test users', function () {
        const devUser = { id: 'exe66', username: 'Dev One' };
        const devIdentity: ISignInIdentity = { username: 'Order66', provider: 'dev-user', providerId: 'order66', email: 'order66@local.karabast' };
        const devToken = mintSessionToken(signInClaims(devIdentity));
        const unknownDevToken = mintSessionToken(signInClaims({ ...devIdentity, providerId: 'unknown' }));

        // The harness builds the server directly, so the startup seeding in GameServer.create has not run:
        // these show a dev session finds its account on the request path alone.
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

                it('signs a dev-user session in to its test account over the API', async function () {
                    const response = await getUserAsync(contextRef.harness, devToken);

                    expect(response.status).toBe(200);
                    expect(response.body.user).toEqual(jasmine.objectContaining({ id: 'exe66', username: 'Order66' }));
                });

                it('signs a dev-user session in whether or not it says its email is verified, as it has no provider', async function () {
                    const { harness } = contextRef;

                    const withoutClaimResponse = await getUserAsync(harness, mintSessionToken(withoutClaim(signInClaims(devIdentity), 'emailVerified')));
                    const unverifiedResponse = await getUserAsync(harness, mintSessionToken(signInClaims({ ...devIdentity, emailVerified: false })));

                    expect(withoutClaimResponse.status).toBe(200);
                    expect(unverifiedResponse.status).toBe(200);
                });

                it('signs a dev-user session in to its test account on a socket', async function () {
                    const { harness } = contextRef;
                    const client = harness.createClient();
                    const owner = await harness.openLobbyAsync();

                    await client.connectAsync({ lobbyId: owner.lobbyId, token: devToken });

                    expect(client.lobbyState.users).toContain(jasmine.objectContaining({ id: 'exe66', authenticated: true }));
                });

                it('refuses a session for an unknown dev identity, and creates nothing for it', async function () {
                    const { harness } = contextRef;

                    const synced = await getUserAsync(harness, unknownDevToken);
                    const created = await createUserAsync(harness, unknownDevToken);

                    expect(synced.status).toBe(401);
                    expect(synced.body).toEqual(authenticationFailed);
                    expect(created.status).toBe(401);
                    expect(created.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });
            });
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

                it('refuses a validly signed dev-user session over the API, and creates nothing for it', async function () {
                    const { harness } = contextRef;

                    const synced = await getUserAsync(harness, devToken);
                    const created = await createUserAsync(harness, devToken);

                    expect(synced.status).toBe(401);
                    expect(synced.body).toEqual(authenticationFailed);
                    expect(created.status).toBe(401);
                    expect(created.body).toEqual(authenticationFailed);
                    expectNothingStored(harness);
                });

                it('refuses a validly signed dev-user session on a socket', async function () {
                    const { harness } = contextRef;

                    const result = await harness.createClient().attemptConnectAsync({ token: devToken });

                    expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
                    expectNothingStored(harness);
                });
            }, { env: { ENVIRONMENT: 'production' } });
        });
    });
});
