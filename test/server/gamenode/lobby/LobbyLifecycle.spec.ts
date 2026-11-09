import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { TestClient } from '../../../helpers/server/TestClient';

const oneMinuteMs = 60 * 1000;

/**
 * What the server does with a custom lobby over its life: who owns it, when it goes away, and what happens to
 * a player in it who makes for another lobby or the queue (`GameServer.canUserJoinNewLobby`). The refactor-readiness
 * checklist's rows L1, L3, D1, D2 (for the last player) and B3 to B9.
 */
describe('Lobby lifecycle', function () {
    /**
     * Whether a newcomer following the lobby's link is seated - the link is refused once the lobby has gone. Only
     * meaningful for a lobby with a free seat and no game, the only other reasons a link is refused.
     */
    async function linkSeatsNewcomerAsync(harness: ServerTestHarness, lobbyId: string): Promise<boolean> {
        const newcomer = harness.createClient();
        await newcomer.connectAsync({ lobbyId });
        return newcomer.isConnected && newcomer.lobbyState?.users?.some((user: { id: string }) => user.id === newcomer.id);
    }

    async function isListedAsync(harness: ServerTestHarness, lobbyId: string): Promise<boolean> {
        const response = await harness.api.get('/api/available-lobbies');
        return (response.body as { id: string }[]).some((lobby) => lobby.id === lobbyId);
    }

    serverIntegration(function (contextRef) {
        describe('ownership', function () {
            it('belongs to the player who created the lobby', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync();

                expect(guest.lobbyState.lobbyOwnerId).toBe(owner.id);
            });

            it('passes to the remaining player when the owner leaves', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync();

                await owner.manualDisconnectAsync();

                expect(guest.lobbyState.lobbyOwnerId).toBe(guest.id);
            });
        });

        describe('closing', function () {
            it('removes a lobby, and stops listing it, when its last player leaves', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const lobbyId = owner.lobbyId;
                const listedBefore = await isListedAsync(harness, lobbyId);

                await owner.manualDisconnectAsync();

                expect(listedBefore).toBeTrue();
                expect(await isListedAsync(harness, lobbyId)).toBeFalse();
                expect(await linkSeatsNewcomerAsync(harness, lobbyId)).toBeFalse();
                expect(harness.server.testLobbies.has(lobbyId)).withContext('the server no longer holds it')
                    .toBeFalse();
            });

            it('removes a lobby when its last player drops and does not come back within the grace window', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const lobbyId = owner.lobbyId;

                await owner.disconnectTransportAsync();
                await harness.clock.advanceAsync(20_000);

                expect(await linkSeatsNewcomerAsync(harness, lobbyId)).toBeFalse();
                expect(harness.server.testLobbies.has(lobbyId)).withContext('the server no longer holds it')
                    .toBeFalse();
                expect(await owner.hasNoPlaceAsync()).withContext('the owner\'s seat went with it')
                    .toBeTrue();
            });

            describe('after five players have come and gone', function () {
                async function cycleGuestsAsync(harness: ServerTestHarness, lobbyId: string, count: number): Promise<void> {
                    for (let i = 0; i < count; i++) {
                        const guest = harness.createClient();
                        expect((await guest.joinLobbyAsync(lobbyId)).status).toBe(200);
                        await guest.connectAsync();
                        await guest.manualDisconnectAsync();
                    }
                }

                it('times the lobby out, telling the player still in it, once it is five minutes old', async function () {
                    const { harness } = contextRef;
                    const owner = await harness.openLobbyAsync();
                    const lobbyId = owner.lobbyId;

                    await cycleGuestsAsync(harness, lobbyId, 4);
                    await harness.clock.advanceAsync(5 * oneMinuteMs);
                    await cycleGuestsAsync(harness, lobbyId, 1);

                    expect(owner.connectionErrors).toEqual(['Lobby timed out']);
                    expect(await linkSeatsNewcomerAsync(harness, lobbyId)).toBeFalse();
                    expect(harness.server.testLobbies.has(lobbyId)).withContext('the server no longer holds it')
                        .toBeFalse();
                });

                it('keeps a lobby younger than five minutes, and times it out at the next departure after that', async function () {
                    const { harness } = contextRef;
                    const owner = await harness.openLobbyAsync();
                    const lobbyId = owner.lobbyId;

                    await cycleGuestsAsync(harness, lobbyId, 5);
                    await harness.clock.advanceAsync(5 * oneMinuteMs - 1);
                    await cycleGuestsAsync(harness, lobbyId, 1);
                    const errorsAtFirst = [...owner.connectionErrors];
                    await harness.clock.advanceAsync(1);
                    await cycleGuestsAsync(harness, lobbyId, 1);

                    expect(errorsAtFirst).toEqual([]);
                    expect(owner.connectionErrors).toEqual(['Lobby timed out']);
                    expect(await linkSeatsNewcomerAsync(harness, lobbyId)).toBeFalse();
                    expect(harness.server.testLobbies.has(lobbyId)).withContext('the server no longer holds it')
                        .toBeFalse();
                });
            });
        });

        describe('a player whose lobby closed before their socket arrived', function () {
            async function strandedJoinerAsync(harness: ServerTestHarness): Promise<{ joiner: TestClient; lobbyId: string }> {
                const owner = await harness.openLobbyAsync();
                const lobbyId = owner.lobbyId;
                const joiner = harness.createClient();
                expect((await joiner.joinLobbyAsync(lobbyId)).status).toBe(200);
                await owner.manualDisconnectAsync();
                return { joiner, lobbyId };
            }

            it('is told the lobby was not found when choosing a deck for it', async function () {
                const { harness } = contextRef;
                const { joiner, lobbyId } = await strandedJoinerAsync(harness);

                const response = await joiner.changeDeckAsync(lobbyId, harness.decklists.validDecklist());

                expect(response.status).toBe(404);
                expect(response.body).toEqual({ success: false, error: 'Lobby not found' });
            });

            it('may create another lobby at once', async function () {
                const { harness } = contextRef;
                const { joiner } = await strandedJoinerAsync(harness);

                const owned = await harness.openLobbyAsync(joiner);

                expect(owned.lobbyState.lobbyOwnerId).toBe(joiner.id);
            });
        });

        describe('a player in a lobby who makes for another lobby or the queue', function () {
            it('is refused while they have been active in their lobby within the last 60 seconds', async function () {
                const { harness } = contextRef;
                const { owner } = await harness.createLobbyWithGuestAsync();
                const elsewhere = await harness.openLobbyAsync();
                await harness.clock.advanceAsync(oneMinuteMs - 1);

                const joined = await owner.joinLobbyAsync(elsewhere.lobbyId);
                const queued = await owner.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

                expect(joined.status).toBe(403);
                expect(joined.body).toEqual({ success: false, message: 'User is already in a lobby' });
                expect(queued.status).toBe(403);
                expect(queued.body).toEqual({ success: false, message: 'User is already in a lobby' });
            });

            it('is let go after 60 seconds without activity, leaving the old lobby to the other player', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.createLobbyWithGuestAsync();
                const elsewhere = await harness.openLobbyAsync();
                await harness.clock.advanceAsync(oneMinuteMs);

                const joined = await owner.joinLobbyAsync(elsewhere.lobbyId);

                expect(joined.status).toBe(200);
                expect(guest.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([guest.id]);
                expect(guest.lobbyState.lobbyOwnerId).toBe(guest.id);
                await owner.connectAsync();
                expect(owner.lobbyId).withContext('the owner is seated in the lobby they joined')
                    .toBe(elsewhere.lobbyId);
                expect(guest.lobbyId).withContext('the old lobby stays, with the guest in it')
                    .toBe(lobbyId);
            });

            it('takes the old lobby away when the player who left it idle was its only player', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const oldLobbyId = owner.lobbyId;
                await harness.clock.advanceAsync(oneMinuteMs);

                await harness.openLobbyAsync(owner, { connect: false });

                expect(await linkSeatsNewcomerAsync(harness, oldLobbyId)).toBeFalse();
                expect(harness.server.testLobbies.has(oldLobbyId)).withContext('the server no longer holds it')
                    .toBeFalse();
            });

            it('may join somewhere else at once if they never connected to the lobby they joined', async function () {
                const { harness } = contextRef;
                const first = await harness.openLobbyAsync();
                const second = await harness.openLobbyAsync();
                const joiner = harness.createClient();
                expect((await joiner.joinLobbyAsync(first.lobbyId)).status).toBe(200);

                const switched = await joiner.joinLobbyAsync(second.lobbyId);
                await joiner.connectAsync();

                expect(switched.status).toBe(200);
                expect(joiner.lobbyId).toBe(second.lobbyId);
            });

            it('is taken out of a lobby they joined but never connected to when they enter the queue', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const joiner = harness.createClient();
                expect((await joiner.joinLobbyAsync(owner.lobbyId)).status).toBe(200);

                expect((await joiner.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne })).status).toBe(200);
                await joiner.connectAsync();
                const opponent = harness.createClient();
                expect((await opponent.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne })).status).toBe(200);
                await opponent.connectAsync();

                expect(joiner.lobbyState.users.map((user: { id: string }) => user.id).sort()).withContext('matched from the queue')
                    .toEqual([joiner.id, opponent.id].sort());
                expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id]);
            });

            it('is taken out of the queue when they create a lobby', async function () {
                const { harness } = contextRef;
                const queued = harness.createClient();
                expect((await queued.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne })).status).toBe(200);
                await queued.connectAsync();

                await harness.openLobbyAsync(queued, { connect: false });
                const latecomer = harness.createClient();
                expect((await latecomer.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne })).status).toBe(200);
                await latecomer.connectAsync();
                await harness.clock.advanceAsync(30_000);

                expect(latecomer.lobbyState).toBeUndefined();
            });
        });
    });
});
