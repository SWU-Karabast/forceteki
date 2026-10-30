import { FakeDynamoDbService } from '../../../helpers/server/FakeDynamoDbService';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';

const moderatorId = 'moderator-1';

/**
 * Proves the harness options the auth suite is built on: a database behind the server, accounts a
 * token alone can sign in to, an environment a spec can change, and a record of the routes. These are
 * wiring proofs, not coverage of the server behaviours that sit on top of them.
 */
describe('ServerTestHarness', function () {
    describe('without a database', function () {
        serverIntegration(function (contextRef) {
            it('has no database to read or seed', function () {
                expect(() => contextRef.harness.db).toThrowError(/no database/);
            });

            it('answers a role check with an error, because no role can be granted', async function () {
                const user = contextRef.harness.createClient({ authenticated: true });

                const response = await user.requestAsync('post', '/api/mod/find-user');

                expect(response.status).toBe(403);
                expect(response.body.message).toBe('Server role service unavailable');
            });
        });
    });

    describe('with a database seeded before the server starts', function () {
        serverIntegration(function (contextRef) {
            it('builds the role cache over it, so a seeded moderator passes the moderator check', async function () {
                const { harness } = contextRef;
                const moderator = harness.createClient({
                    authenticated: true,
                    auth: 'token-only',
                    account: harness.db.seedAccount({ id: moderatorId, username: 'ModOne' }),
                });
                const nobody = harness.createClient({ authenticated: true, auth: 'token-only', account: harness.db.seedAccount() });

                const moderatorResponse = await moderator.requestAsync('get', '/api/user-is-moderator');
                const nobodyResponse = await nobody.requestAsync('get', '/api/user-is-moderator');

                expect(moderatorResponse.body).toEqual({ success: true, message: 'User has required privileges' });
                expect(nobodyResponse.body).toEqual({ success: false, message: 'Moderator privileges required' });
            });

            it('builds the settings cache over it, so seeded maintenance mode refuses new games', async function () {
                const { harness } = contextRef;

                const response = await harness.createClient().createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });

                expect(response.status).toBe(503);
                expect(response.body.message).toBe('Back soon');
            });
        }, {
            database: (db) => {
                db.seedRoles({ moderators: [moderatorId] });
                db.seedSettings({ gamesEnabled: false, maintenanceMessage: 'Back soon' });
            },
        });
    });

    describe('with an empty database', function () {
        serverIntegration(function (contextRef) {
            it('gives each spec its own database', function () {
                const { harness } = contextRef;

                expect(harness.db.profiles.size).toBe(0);
                harness.db.seedAccount();
                expect(harness.db.profiles.size).toBe(1);
            });

            it('signs in a client that presents only a token, from the account it was seeded as', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'SeededUser' });
                const client = harness.createClient({ authenticated: true, auth: 'token-only', account });

                const response = await client.requestAsync('post', '/api/get-user');

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual(jasmine.objectContaining({ id: account.id, username: 'SeededUser' }));
                expect(harness.db.loggedInUserIds).toEqual([account.id]);
            });

            it('carries a token-only client through the lobby flow under the stored username', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });
                const client = harness.createClient({ authenticated: true, auth: 'token-only', account });

                const created = await client.createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });
                await client.connectAsync();

                expect(created.status).toBe(200);
                expect(client.lobbyState.users.map((user: { username: string }) => user.username)).toEqual(['StoredName']);
            });

            it('refuses a token-only client that has no account to be', function () {
                expect(() => contextRef.harness.createClient({ authenticated: true, auth: 'token-only' }))
                    .toThrowError(/needs the seeded `account`/);
            });
        }, { database: true });
    });

    describe('shutting down', function () {
        it('leaves nothing scheduled, including the database-backed services\' refresh timers', async function () {
            const harness = await ServerTestHarness.createAsync({ database: true });
            expect(harness.clock.pendingTaskCount).toBeGreaterThan(0);

            await harness.shutdownAsync();

            expect(harness.clock.pendingTaskCount).toBe(0);
        });
    });

    describe('overriding the environment', function () {
        it('applies for the life of the harness and puts everything back afterwards', async function () {
            const before = { environment: process.env.ENVIRONMENT, secret: process.env.INTRASERVICE_SECRET };

            const harness = await ServerTestHarness.createAsync({
                database: true,
                env: { ENVIRONMENT: 'production', INTRASERVICE_SECRET: undefined },
            });
            const during = { environment: process.env.ENVIRONMENT, secret: process.env.INTRASERVICE_SECRET };
            await harness.shutdownAsync();

            expect(during).toEqual({ environment: 'production', secret: undefined });
            expect(process.env.ENVIRONMENT).toBe(before.environment);
            expect(process.env.INTRASERVICE_SECRET).toBe(before.secret);
        });

        it('refuses a production-like server with no database, and still restores the environment', async function () {
            const before = process.env.ENVIRONMENT;

            await expectAsync(ServerTestHarness.createAsync({ env: { ENVIRONMENT: 'production' } }))
                .toBeRejectedWithError(/give the harness a database/);

            expect(process.env.ENVIRONMENT).toBe(before);
        });

        it('lets a spec hold the fake database itself', async function () {
            const database = new FakeDynamoDbService();
            const harness = await ServerTestHarness.createAsync({ database });

            try {
                expect(harness.db).toBe(database);
            } finally {
                await harness.shutdownAsync();
            }
        });
    });

    describe('recording routes', function () {
        serverIntegration(function (contextRef) {
            it('lists the routes the server registers, without reading its settings as routes', function () {
                const { routes } = contextRef.harness;

                expect(routes).toContain({ method: 'post', path: '/api/get-user' });
                expect(routes).toContain({ method: 'get', path: '/api/health' });
                expect(routes.every((route) => route.path.startsWith('/'))).toBeTrue();
            });
        }, { recordRoutes: true });

        serverIntegration(function (contextRef) {
            it('is not available unless it was asked for', function () {
                expect(() => contextRef.harness.routes).toThrowError(/routes were not recorded/);
            });
        });
    });
});
