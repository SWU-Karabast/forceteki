import { RematchMode } from '../../../../server/game/core/Constants';
import { premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * A spectator is shown the players by seat ("Player 1", "Player 2"), never by name. The client does that by
 * finding each player a chat line names as a player part, by id, and showing their seat instead. A username
 * written into the text of a line cannot be swapped, so every line that names a player must name them as a part
 * (`IChatEntry.playerIds`), in the game chat a spectator watches and in the lobby chat a spectator can be sent
 * between the games of a rematch.
 */
describe('Spectator identity', function () {
    /** A logged-in spectator, connected to the game in `lobbyId`. */
    async function connectedSpectatorAsync(harness: ServerTestHarness, lobbyId: string): Promise<TestClient> {
        const spectator = harness.createClient(loggedIn);
        const response = await spectator.spectateGameAsync(lobbyId);
        expect(response.status).withContext(JSON.stringify(response.body))
            .toBe(200);
        await spectator.connectAsync({ spectator: true });
        return spectator;
    }

    serverIntegration(function (contextRef) {
        describe('in the game chat a spectator watches', function () {
            const rematchRequests: [RematchMode, string][] = [
                [RematchMode.Regular, 'has requested a rematch!'],
                [RematchMode.Reset, 'has requested a quick rematch!'],
                [RematchMode.Bo1ConvertToBo3, 'has requested to convert to a best-of-three match!'],
            ];

            for (const [mode, wording] of rematchRequests) {
                it(`names a player who requests a rematch (${mode}) as a player part`, async function () {
                    const { harness } = contextRef;
                    const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
                    const spectator = await connectedSpectatorAsync(harness, lobbyId);
                    await owner.concedeAsync();

                    await guest.requestRematchAsync(mode);

                    expect(spectator.gameChat).toContain(jasmine.objectContaining({
                        text: `${guest.username} ${wording}`,
                        playerIds: [guest.id],
                    }));
                });
            }
        });

        describe('in the lobby chat', function () {
            it('names the players who create, join, change settings and ready up as player parts', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(loggedIn, loggedIn, { isPrivate: true });

                await owner.updateSettingAsync('requestUndo', true);
                await owner.updateSettingAsync('allowSpectators', true);
                await guest.setReadyStatusAsync(true);

                expect(owner.lobbyChat).toEqual(jasmine.arrayContaining([
                    jasmine.objectContaining({ text: `${owner.username} has created and joined the lobby`, playerIds: [owner.id] }),
                    jasmine.objectContaining({ text: `${guest.username} has joined the lobby`, playerIds: [guest.id] }),
                    jasmine.objectContaining({ text: `${owner.username} has enabled undo confirmation`, playerIds: [owner.id] }),
                    jasmine.objectContaining({ text: `${owner.username} has enabled spectation`, playerIds: [owner.id] }),
                    jasmine.objectContaining({ text: `${guest.username} is ready to start`, playerIds: [guest.id] }),
                ]));
            });

            it('names a player whose deck is too small to start as a player part', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(loggedIn, loggedIn, { isPrivate: true });
                // both players hold the default deck, which is exactly the minimum size, so moving a card out shrinks it below
                await guest.updateDeckAsync('Deck', harness.decklists.validDecklist().deck[0].id);
                await owner.setReadyStatusAsync(true);
                await guest.setReadyStatusAsync(true);

                await owner.startGameAsync();

                expect(owner.lobbyChat).toContain(jasmine.objectContaining({
                    text: `Cannot start game: ${guest.username} has an invalid deck (check deck size). Please fix your deck and ready up again.`,
                    playerIds: [guest.id],
                }));
            });

            it('names a player who is ready for the next game of a best-of-three as a player part', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync(loggedIn, loggedIn, { config: premierBestOfThree });
                await guest.concedeAsync();

                await owner.proceedToNextBo3GameAsync();

                expect(guest.lobbyChat).toContain(jasmine.objectContaining({
                    text: `${owner.username} is ready for the next game.`,
                    playerIds: [owner.id],
                }));
            });
        });
    });
});
