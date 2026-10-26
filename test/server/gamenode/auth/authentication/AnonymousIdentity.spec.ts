import { v4 as uuid } from 'uuid';

import { AnonymousUser } from '../../../../../server/utils/user/User';
import { UserFactory } from '../../../../../server/utils/user/UserFactory';
import { premierBestOfOne } from '../../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';
import { TestClient } from '../../../../helpers/server/TestClient';

/**
 * Anonymous users have no token, so everything the server knows about them comes from the client.
 * These cover the parts of that the server no longer trusts: the username (always derived from the
 * id), the id's format, and whether an id that belongs to a logged-in user can be presented by an
 * anonymous connection to take over that user's lobby seat or queue entry.
 */
describe('Anonymous user identity', function () {
    describe('UserFactory.createAnonymousUserFromQuery', function () {
        const userFactory = new UserFactory();

        it('derives the username from the id, ignoring the client-supplied one', function () {
            const id = uuid();

            const user = userFactory.createAnonymousUserFromQuery({ user: JSON.stringify({ id, username: 'not-anon' }) });

            expect(user.getId()).toBe(id);
            expect(user.getUsername()).toBe(`anonymous ${id.substring(0, 6)}`);
            expect(user.hasClientProvidedId()).toBeTrue();
        });

        it('rejects an id that is not a UUID', function () {
            expect(() => userFactory.createAnonymousUserFromQuery({ user: JSON.stringify({ id: 'not-anon-id', username: 'anonymous name' }) }))
                .toThrowError(/not a valid UUID/);
        });

        it('generates an id when the client does not supply one', function () {
            const user = userFactory.createAnonymousUserFromQuery({ user: JSON.stringify({ id: null, username: 'anonymous null' }) });

            expect(user.getId()).toBeTruthy();
            expect(user.getUsername()).toBe('AnonymousPlayer');
            expect(user.hasClientProvidedId()).toBeFalse();
        });

        it('keeps the dev test users\' ids and names in development', function () {
            const user = userFactory.createAnonymousUserFromQuery({ user: JSON.stringify({ id: 'exe66', username: 'Order66' }) });

            expect(user.getId()).toBe('exe66');
            expect(user.getUsername()).toBe('Order66');
            expect(user.isDevTestUser()).toBeTrue();
        });
    });

    serverIntegration(function (contextRef) {
        async function createLobbyAsync(harness: ServerTestHarness, owner: TestClient, isPrivate = false) {
            const created = await owner.createLobbyAsync({
                lobbyName: harness.uniqueLobbyName(),
                deck: harness.decklists.validDecklist(),
                isPrivate,
                ...premierBestOfOne,
            });
            expect(created.status).withContext(JSON.stringify(created.body))
                .toBe(200);
        }

        describe('anonymous username', function () {
            it('shows the derived name in the lobby even if the client sent a different one', async function () {
                const { harness } = contextRef;
                const id = uuid();

                const created = await harness.api.post('/api/create-lobby').send({
                    user: { id, username: 'not-anon' },
                    deck: harness.decklists.validDecklist(),
                    lobbyName: harness.uniqueLobbyName(),
                    isPrivate: false,
                    ...premierBestOfOne,
                });
                expect(created.status).toBe(200);

                const owner = TestClient.create(harness, id);
                await owner.connectAsync();

                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual([AnonymousUser.usernameForId(id)]);
            });

            it('rejects an HTTP request carrying a non-UUID anonymous id', async function () {
                const { harness } = contextRef;

                const response = await harness.api.post('/api/create-lobby').send({
                    user: { id: 'not-anon-id', username: 'not-anon' },
                    deck: harness.decklists.validDecklist(),
                    lobbyName: harness.uniqueLobbyName(),
                    isPrivate: false,
                    ...premierBestOfOne,
                });

                expect(response.status).toBe(401);
            });
        });

        describe('an anonymous connection presenting a logged-in user\'s id', function () {
            it('cannot take over their lobby seat', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient({ authenticated: true });
                await createLobbyAsync(harness, owner);
                await owner.connectAsync();

                const impostor = TestClient.create(harness, owner.id);
                await impostor.attemptConnectAsync();

                expect(impostor.connectionErrors).toEqual(['Connection error, please try again']);
                expect(impostor.socket.connected).toBeFalse();
                expect(owner.socket.connected).toBeTrue();
            });

            it('cannot claim a seat registered over HTTP before the owner\'s socket connects', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                await createLobbyAsync(harness, owner, true);
                await owner.connectAsync();
                const lobbyId = owner.lobbyId;

                const joiner = harness.createClient({ authenticated: true });
                expect((await joiner.joinLobbyAsync(lobbyId)).status).toBe(200);

                const impostor = TestClient.create(harness, joiner.id);
                await impostor.attemptConnectAsync();
                expect(impostor.socket.connected).toBeFalse();

                await joiner.connectAsync();
                expect(owner.lobbyState.users.map((u: any) => u.id).sort()).toEqual([owner.id, joiner.id].sort());
            });

            it('cannot take over their queue entry', async function () {
                const { harness } = contextRef;
                const queued = harness.createClient({ authenticated: true });
                const entered = await queued.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                expect(entered.status).toBe(200);
                await queued.connectAsync();

                const impostor = TestClient.create(harness, queued.id);
                await impostor.attemptConnectAsync();

                expect(impostor.socket.connected).toBeFalse();
                expect(queued.socket.connected).toBeTrue();
            });

            it('cannot evict them from the queue or a lobby by making a lobby or queue call with their id', async function () {
                const { harness } = contextRef;
                const queued = harness.createClient({ authenticated: true });
                await queued.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await queued.connectAsync();

                const impostor = TestClient.create(harness, queued.id);
                const queueResponse = await impostor.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                expect(queueResponse.status).toBe(403);

                const lobbyResponse = await impostor.createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });
                expect(lobbyResponse.status).toBe(403);

                // still queued: a second player is matched with them
                const opponent = harness.createClient({ authenticated: true });
                await opponent.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await opponent.connectAsync();
                expect(queued.lobbyState?.users.map((u: any) => u.id).sort()).toEqual([queued.id, opponent.id].sort());
            });
        });

        describe('a logged-in user whose id an anonymous request registered first', function () {
            it('is not locked out by an anonymous join-lobby call', async function () {
                const { harness } = contextRef;
                const host = harness.createClient();
                await createLobbyAsync(harness, host);
                await host.connectAsync();
                const hostLobbyId = host.lobbyId;

                const victim = harness.createClient({ authenticated: true });
                const impostor = TestClient.create(harness, victim.id);
                expect((await impostor.joinLobbyAsync(hostLobbyId)).status).toBe(200);

                await createLobbyAsync(harness, victim);
                await victim.connectAsync();

                expect(victim.connectionErrors).toEqual([]);
                expect(victim.lobbyState.users.map((u: any) => u.id)).toEqual([victim.id]);
            });

            it('is not locked out by an anonymous enter-queue call', async function () {
                const { harness } = contextRef;
                const victim = harness.createClient({ authenticated: true });
                const impostor = TestClient.create(harness, victim.id);
                expect((await impostor.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne })).status).toBe(200);

                const entered = await victim.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                expect(entered.status).toBe(200);
                await victim.connectAsync();

                expect(victim.connectionErrors).toEqual([]);
            });

            it('evicts an impostor already seated under their id', async function () {
                const { harness } = contextRef;
                const host = harness.createClient();
                await createLobbyAsync(harness, host, true);
                await host.connectAsync();
                const hostLobbyId = host.lobbyId;

                const victim = harness.createClient({ authenticated: true });
                const impostor = TestClient.create(harness, victim.id);
                await impostor.connectAsync({ lobbyId: hostLobbyId });
                expect(host.lobbyState.users.map((u: any) => u.id)).toContain(victim.id);

                await createLobbyAsync(harness, victim);

                expect(impostor.socket.connected).toBeFalse();
                expect(host.lobbyState.users.map((u: any) => u.id)).toEqual([host.id]);
            });
        });

        it('does not let an anonymous caller change a logged-in player\'s deck', async function () {
            const { harness } = contextRef;
            const owner = harness.createClient({ authenticated: true });
            await createLobbyAsync(harness, owner, true);
            await owner.connectAsync();
            const lobbyId = owner.lobbyId;

            const impostor = TestClient.create(harness, owner.id);
            expect((await impostor.changeDeckAsync(lobbyId, harness.decklists.undersizedDecklist())).status).toBe(403);
            expect((await owner.changeDeckAsync(lobbyId, harness.decklists.validDecklist())).status).toBe(200);
        });

        it('still lets an anonymous user reconnect to their own seat', async function () {
            const { harness } = contextRef;
            const owner = harness.createClient();
            await createLobbyAsync(harness, owner);
            await owner.connectAsync();

            await owner.connectAsync();

            expect(owner.socket.connected).toBeTrue();
            expect(owner.connectionErrors).toEqual([]);
        });
    });
});
