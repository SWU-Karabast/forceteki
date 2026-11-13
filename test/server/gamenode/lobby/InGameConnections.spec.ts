import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

const disconnectGraceMs = 20_000;

/**
 * A player's connection coming and going during a game: a drop and a return, a drop that outlasts the grace window, and
 * a second tab. The refactor-readiness checklist's rows C13 (for an in-game player) and D4. The same in a lobby before
 * the game is in `LobbyConnectionManagement`.
 */
describe('In-game connections', function () {
    serverIntegration(function (contextRef) {
        describe('during a game', function () {
            it('sends a player who drops and comes back the lobby and the game again', async function () {
                const { harness } = contextRef;
                const { guest } = await harness.startLiveGameAsync();

                await guest.disconnectTransportAsync();
                await harness.clock.advanceAsync(disconnectGraceMs / 2);
                await guest.connectAsync();

                expect(guest.receivedEvents('lobbystate').length).toBe(1);
                expect(guest.receivedEvents('gamestate').length).toBe(1);
                expect(guest.gameState.winners).toEqual([]);
            });

            it('ends the game in the opponent\'s favour when a player stays away past the grace window', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();

                await guest.disconnectTransportAsync();
                await harness.clock.advanceAsync(disconnectGraceMs - 1);
                const winnersBefore = owner.gameState.winners;
                await harness.clock.advanceAsync(1);

                expect(winnersBefore).toEqual([]);
                expect(owner.gameState.winners).toEqual([owner.username]);
                expect(owner.gameChat.map((entry) => entry.text)).toContain(`${guest.username} has left the game`);
            });

            it('moves a player to a second tab, disconnecting the first, and sends the game there', async function () {
                const { harness } = contextRef;
                const { owner } = await harness.startLiveGameAsync();

                await owner.connectAsync();

                expect(owner.previousSocket.connected).toBeFalse();
                expect(owner.isConnected).toBeTrue();
                expect(owner.gameState).toBeDefined();
            });

            // No spec for the inactivity kick: it is a dead feature, to be removed (open finding #11, in the game-timer
            // area's step d).
            // TODO (open finding #11): if the action timer is made to read player activity again, add specs that
            // `resetActionTimer` and other game messages hold it off.
        });
    });
});
