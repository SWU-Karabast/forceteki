import { RematchMode } from '../../../../server/game/core/Constants';
import type { ISerializedMessage } from '../../../../server/game/Interfaces';
import { premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

// players with names chosen here, so each spec can spell out the exact line it expects
const alice: ITestClientOptions = { authenticated: true, username: 'Alice' };
const bob: ITestClientOptions = { authenticated: true, username: 'Bob' };

// names that appear nowhere else in a game (no card is called anything like them), for specs that search everything sent
const wyvernquill: ITestClientOptions = { authenticated: true, username: 'Wyvernquill' };
const marrowpike: ITestClientOptions = { authenticated: true, username: 'Marrowpike' };

/**
 * A spectator is shown the players by seat ("Player 1", "Player 2"), never by name or account. During a game the
 * server sends a spectator the players by seat (`SpectatorView`). Every line that names a player must name them as
 * a part (`IChatEntry.playerIds`) for that to work, since a username written into the text of a line cannot be
 * swapped; the lobby chat, which a spectator can be sent between the games of a rematch, is still swapped by the
 * client.
 */
describe('Spectator identity', function () {
    /** A logged-in spectator, connected to the game in `lobbyId`. */
    async function connectedSpectatorAsync(harness: ServerTestHarness, lobbyId: string, options: ITestClientOptions = loggedIn): Promise<TestClient> {
        const spectator = harness.createClient(options);
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

            for (const [mode, request] of rematchRequests) {
                it(`names a player who requests a rematch (${mode}) by seat`, async function () {
                    const { harness } = contextRef;
                    const { owner, guest, lobbyId } = await harness.startLiveGameAsync(alice, bob);
                    const spectator = await connectedSpectatorAsync(harness, lobbyId);
                    await owner.concedeAsync();

                    await guest.requestRematchAsync(mode);

                    expect(spectator.gameChat).toContain(jasmine.objectContaining({
                        text: `${guest.spectatorSeat.name} ${request}`,
                        playerIds: [guest.spectatorSeat.id],
                    }));
                    expect(owner.gameChat).withContext('the players are still sent the name')
                        .toContain(jasmine.objectContaining({ text: `Bob ${request}`, playerIds: [guest.id] }));
                });
            }
        });

        describe('in the lobby chat', function () {
            it('names the players who create, join, change settings and ready up as player parts', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(alice, bob, { isPrivate: true });

                await owner.updateSettingAsync('requestUndo', true);
                await owner.updateSettingAsync('allowSpectators', true);
                await guest.setReadyStatusAsync(true);

                expect(owner.lobbyChat).toEqual(jasmine.arrayContaining([
                    jasmine.objectContaining({ text: 'Alice has created and joined the lobby', playerIds: [owner.id] }),
                    jasmine.objectContaining({ text: 'Bob has joined the lobby', playerIds: [guest.id] }),
                    jasmine.objectContaining({ text: 'Alice has enabled undo confirmation', playerIds: [owner.id] }),
                    jasmine.objectContaining({ text: 'Alice has enabled spectation', playerIds: [owner.id] }),
                    jasmine.objectContaining({ text: 'Bob is ready to start', playerIds: [guest.id] }),
                ]));
            });

            it('names a player whose deck is too small to start as a player part', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(alice, bob, { isPrivate: true });
                // both players hold the default deck, which is exactly the minimum size, so moving a card out shrinks it below
                await guest.updateDeckAsync('Deck', harness.decklists.validDecklist().deck[0].id);
                await owner.setReadyStatusAsync(true);
                await guest.setReadyStatusAsync(true);

                await owner.startGameAsync();

                expect(owner.lobbyChat).toContain(jasmine.objectContaining({
                    text: 'Cannot start game: Bob has an invalid deck (check deck size). Please fix your deck and ready up again.',
                    playerIds: [guest.id],
                }));
            });

            it('names a player who is ready for the next game of a best-of-three as a player part', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync(alice, bob, { config: premierBestOfThree });
                await guest.concedeAsync();

                await owner.proceedToNextBo3GameAsync();

                expect(guest.lobbyChat).toContain(jasmine.objectContaining({
                    text: 'Alice is ready for the next game.',
                    playerIds: [owner.id],
                }));
            });
        });

        describe('in what a spectator is sent during a game', function () {
            it('shows each player by seat, with no name, account or cosmetics', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.startLiveGameAsync(wyvernquill, marrowpike);
                const spectator = await connectedSpectatorAsync(harness, lobbyId);

                const players = spectator.gameState.players;
                expect(Object.keys(players).sort()).toEqual([owner.spectatorSeat.id, guest.spectatorSeat.id].sort());
                for (const seat of [owner.spectatorSeat, guest.spectatorSeat]) {
                    expect(players[seat.id].name).toBe(seat.name);
                    expect(players[seat.id].user).toEqual({ id: seat.id, username: seat.name });
                }
            });

            it('never names a player or gives their account id, in any game state or resent message', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.startLiveGameAsync(wyvernquill, marrowpike);
                await harness.playThroughSetupAsync(owner, guest);
                await owner.sendGameChatAsync('good luck');

                // joining mid-game, the spectator is sent everything said and logged so far
                const spectator = await connectedSpectatorAsync(harness, lobbyId);
                await guest.sendGameChatAsync('you too');
                await owner.concedeAsync();
                await guest.requestRematchAsync(RematchMode.Regular);
                await spectator.retransmitGameMessagesAsync(0, 1000);

                // TODO: once a spectator is sent its own lobby state (spectator projection, part 2), search every frame
                // a spectator receives, the lobby state included, rather than these two events
                const frames = [...spectator.receivedEvents('gamestate'), ...spectator.receivedEvents('retransmitResponse')];
                expect(spectator.receivedEvents('retransmitResponse')[0]?.args[0]?.messages.length)
                    .withContext('the resend was answered with messages')
                    .toBeGreaterThan(0);
                const everythingSent = JSON.stringify(frames);
                for (const player of [owner, guest]) {
                    expect(everythingSent).withContext(`${player.username}: username`)
                        .not.toContain(player.username);
                    expect(everythingSent).withContext(`${player.username}: id`)
                        .not.toContain(player.id);
                }
            });

            it('leaves what the players are sent unchanged, including the game log they share with the spectator', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.startLiveGameAsync(wyvernquill, marrowpike);
                const spectator = await connectedSpectatorAsync(harness, lobbyId);
                await owner.sendGameChatAsync('good luck');
                expect(spectator.gameChat).toContain(jasmine.objectContaining({ senderId: owner.spectatorSeat.id, text: 'good luck' }));

                // asked for again after the spectator was sent it, the line must still name the player
                await guest.retransmitGameMessagesAsync(0, 1000);

                const resent: ISerializedMessage[] = guest.receivedEvents('retransmitResponse')[0].args[0].messages;
                const chatLine = resent.find((entry) => Array.isArray(entry.message) && entry.message[1] === ' good luck');
                expect(chatLine?.message[0]).toEqual(jasmine.objectContaining({ id: owner.id, name: 'Wyvernquill' }));
                expect(guest.gameState.players[owner.id].name).toBe('Wyvernquill');
            });
        });

        describe('in what the players are sent', function () {
            it('gives each player\'s account as only their id, username and cosmetics', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync(wyvernquill, marrowpike);

                for (const player of [owner, guest]) {
                    expect(Object.keys(owner.gameState.players[player.id].user).sort()).toEqual(['cosmetics', 'id', 'username']);
                }
            });

            it('never names a spectator or gives their id, in the game or the lobby state', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await connectedSpectatorAsync(harness, lobbyId, { ...loggedIn, username: 'DistinctiveSpectatorName' });

                // a lobby command makes the lobby send its state again, while the spectator is still watching
                await owner.typingStateAsync(false);
                const countInLobbyState = owner.lobbyState.spectatorCount;
                await spectator.manualDisconnectAsync();

                for (const player of [owner, guest]) {
                    const everythingSent = JSON.stringify(player.receivedEvents());
                    expect(everythingSent).withContext(`${player === owner ? 'owner' : 'guest'}: username`)
                        .not.toContain(spectator.username);
                    expect(everythingSent).withContext(`${player === owner ? 'owner' : 'guest'}: id`)
                        .not.toContain(spectator.id);
                }
                expect(countInLobbyState).withContext('a lobby state reached the owner while the spectator watched')
                    .toBe(1);
            });
        });
    });
});
