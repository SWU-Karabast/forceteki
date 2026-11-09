import { FakeDynamoDbService } from '../../../helpers/server/FakeDynamoDbService';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import { premierBestOfOne, premierBestOfThree } from '../../../helpers/server/MatchConfigs';

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

            it('refuses a role-gated route, because no role can be granted', async function () {
                const response = await contextRef.harness.createClient().requestAsync('post', '/api/mod/find-user');

                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Authentication required');
            });

            it('cannot sign in a logged-in client, because no account can be looked up', function () {
                expect(() => contextRef.harness.createClient({ authenticated: true })).toThrowError(/no database/);
            });
        }, { database: false });
    });

    describe('with a database seeded before the server starts', function () {
        serverIntegration(function (contextRef) {
            it('builds the role cache over it, so a seeded moderator passes the moderator check', async function () {
                const { harness } = contextRef;
                const moderator = harness.createClient({
                    authenticated: true,
                    account: harness.db.seedAccount({ id: moderatorId, username: 'ModOne' }),
                });
                const nobody = harness.createClient({ authenticated: true, account: harness.db.seedAccount() });

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

    describe('with the default, empty database', function () {
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
                const client = harness.createClient({ authenticated: true, account });

                const response = await client.requestAsync('post', '/api/get-user');

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual(jasmine.objectContaining({ id: account.id, username: 'SeededUser' }));
                expect(harness.db.loggedInUserIds).toEqual([account.id]);
            });

            it('carries a logged-in client through the lobby flow under the stored username', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });
                const client = harness.createClient({ authenticated: true, account });

                const created = await client.createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });
                await client.connectAsync();

                expect(created.status).toBe(200);
                expect(client.lobbyState.users.map((user: { username: string }) => user.username)).toEqual(['StoredName']);
            });

            it('makes an account for a logged-in client that is not given one', function () {
                const { harness } = contextRef;

                const client = harness.createClient({ authenticated: true, username: 'MadeForYou' });

                expect(harness.db.profiles.get(client.id)?.username).toBe('MadeForYou');
            });
        });
    });

    describe('shutting down', function () {
        it('leaves nothing scheduled, including the database-backed services\' refresh timers', async function () {
            const harness = await ServerTestHarness.createAsync();
            expect(harness.clock.pendingTaskCount).toBeGreaterThan(0);

            await harness.shutdownAsync();

            expect(harness.clock.pendingTaskCount).toBe(0);
        });
    });

    describe('overriding the environment', function () {
        it('applies for the life of the harness and puts everything back afterwards', async function () {
            const before = { environment: process.env.ENVIRONMENT, secret: process.env.INTRASERVICE_SECRET };

            const harness = await ServerTestHarness.createAsync({
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

            await expectAsync(ServerTestHarness.createAsync({ database: false, env: { ENVIRONMENT: 'production' } }))
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

    describe('scenario builders', function () {
        serverIntegration(function (contextRef) {
            it('opens a lobby whose link another client can join by', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const joiner = harness.createClient();

                await joiner.connectAsync({ lobbyId: owner.lobbyId });

                expect(joiner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id, joiner.id]);
            });

            it('can open a lobby without connecting the owner, who is seated in it once their socket connects', async function () {
                const { harness } = contextRef;

                const owner = await harness.openLobbyAsync({}, { connect: false });
                const connectedBefore = owner.isConnected;
                await owner.connectAsync();

                expect(connectedBefore).toBeFalse();
                expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id]);
            });

            for (const isPrivate of [false, true]) {
                it(`seats a guest in a ${isPrivate ? 'private' : 'public'} lobby`, async function () {
                    const { harness } = contextRef;

                    const { owner, guest, lobbyId } = await harness.createLobbyWithGuestAsync({}, {}, { isPrivate });

                    expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id, guest.id]);
                    expect(guest.lobbyId).toBe(lobbyId);
                });
            }

            it('throws, naming the guest, when the guest is refused the lobby', async function () {
                const { harness } = contextRef;
                const guest = harness.createClient();

                // anonymous players may not join a public best-of-three lobby
                await expectAsync(harness.createLobbyWithGuestAsync({ authenticated: true }, guest, { config: premierBestOfThree }))
                    .toBeRejectedWithError(new RegExp(`user ${guest.id} was refused the lobby`));
            });

            it('starts a lobby game for both players, which a concession ends', async function () {
                const { harness } = contextRef;

                const { owner, guest } = await harness.startLiveGameAsync();
                await guest.concedeAsync();

                expect(owner.gameState.winners).toEqual([owner.username]);
                expect(guest.gameState.winners).toEqual([owner.username]);
            });
        });
    });

    describe('playing a game', function () {
        serverIntegration(function (contextRef) {
            it('plays a lobby game through setup to its first action, which the player with the initiative takes', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();

                const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);

                expect([active, waiting]).toEqual(jasmine.arrayWithExactContents([owner, guest]));
                expect(active.prompt.promptType).toBe('actionWindow');
                expect(active.prompt.buttons.map((button) => button.text)).toContain('Pass');
                expect(waiting.prompt.buttons).toEqual([]);
                expect(active.hand.length).withContext('six drawn, two resourced')
                    .toBe(4);
                expect(waiting.hand.length).toBe(4);
            });

            it('plays a quick-match game through setup as well', async function () {
                const { harness } = contextRef;
                const { first, second } = await harness.startQuickGameAsync();

                const { active } = await harness.playThroughSetupAsync(first, second);

                expect(active.prompt.promptType).toBe('actionWindow');
            });

            it('names the buttons a prompt has when asked to click one it does not', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const { active } = await harness.playThroughSetupAsync(owner, guest);

                await expectAsync(active.clickButtonAsync('Keep')).toBeRejectedWithError(/no enabled 'Keep' button.*"Pass"/);
            });
        });
    });

    describe('reading the chat', function () {
        serverIntegration(function (contextRef) {
            it('reads the lobby chat line by line, with each player\'s messages by sender and alerts as text', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true });

                await owner.sendChatMessageAsync('hello');
                await guest.sendChatMessageAsync('hi back');
                await owner.setReadyStatusAsync(true);

                expect(guest.lobbyChatFrom(owner)).toEqual(['hello']);
                expect(owner.lobbyChatFrom(guest)).toEqual(['hi back']);
                expect(guest.lobbyChat).toContain(jasmine.objectContaining({ alertType: jasmine.any(String), text: `${owner.username} is ready to start` }));
            });

            it('collects the game chat from every game state, including the game log', async function () {
                const { owner, guest } = await contextRef.harness.startLiveGameAsync({ authenticated: true }, { authenticated: true });

                await owner.sendGameChatAsync('good luck');
                await guest.concedeAsync();

                expect(guest.gameChatFrom(owner)).toEqual(['good luck']);
                expect(owner.gameChat.map((entry) => entry.text)).toContain(`${guest.username} concedes the game`);
            });
        });
    });
});
