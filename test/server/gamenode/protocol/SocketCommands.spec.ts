import { Game } from '../../../../server/game/core/Game';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { GameCommand, LobbyCommand } from '../../../../server/gamenode/SocketCommands';
import { premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import type { IServerIntegrationContextRef } from '../../../helpers/server/ServerIntegrationHelper';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';

/** A spec of one command: how a client comes to send it, and what it and the others in its lobby then receive. */
interface ICommandSpec {

    /** What the command does, as the spec's name says it. */
    does: string;
    runAsync: (harness: ServerTestHarness) => Promise<void>;
}

/**
 * What each command has: a spec here; the spec elsewhere that already shows it taking effect; or a spec still to write
 * (the protocol-surface area's step c), which shows as pending.
 */
type CommandEntry = ICommandSpec | { coveredBy: string } | { toDo: true };

const lobbyCommands: Record<LobbyCommand, CommandEntry> = {
    [LobbyCommand.ConcedeBo3]: {
        does: 'concedes the sender\'s best-of-three set',
        runAsync: async (harness) => {
            const { owner } = await harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true, config: premierBestOfThree });

            await owner.concedeBo3Async();

            expect(owner.lobbyState.winHistory.setEndResult?.endedReason).toBe('concede');
        },
    },
    [LobbyCommand.MuteChat]: { coveredBy: 'ChatPermissions' },
    [LobbyCommand.ProceedToNextBo3Game]: {
        does: 'starts the next game of a set once both players have sent it',
        runAsync: async (harness) => {
            const { first: player, second: opponent } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);

            await player.concedeAsync();
            await player.proceedToNextBo3GameAsync();
            await opponent.proceedToNextBo3GameAsync();

            expect(player.lobbyState.winHistory.currentGameNumber).toBe(2);
        },
    },
    [LobbyCommand.Rematch]: { toDo: true },
    [LobbyCommand.ReportScreenResolution]: { toDo: true },
    [LobbyCommand.RequestRematch]: { toDo: true },
    [LobbyCommand.RetransmitGameMessages]: { toDo: true },
    [LobbyCommand.SendChatMessage]: { coveredBy: 'ChatPermissions' },
    [LobbyCommand.SetReadyStatus]: {
        does: 'marks the sender ready, as the others in the lobby see it',
        runAsync: async (harness) => {
            const { owner, guest } = await harness.createLobbyWithGuestAsync();

            await guest.setReadyStatusAsync(true);

            expect(owner.lobbyState.users).toContain(jasmine.objectContaining({ id: guest.id, ready: true }));
        },
    },
    [LobbyCommand.StartGameAsync]: { coveredBy: 'ServerTestHarness (startLiveGameAsync fails unless the game starts)' },
    [LobbyCommand.SubmitReport]: { coveredBy: 'LobbyReports' },
    [LobbyCommand.TypingState]: { coveredBy: 'ChatPermissions' },
    [LobbyCommand.UpdateDeck]: { toDo: true },
    [LobbyCommand.UpdateSetting]: { toDo: true },
};

const gameCommands: Record<GameCommand, CommandEntry> = {
    [GameCommand.CardClicked]: { toDo: true },
    [GameCommand.Chat]: { coveredBy: 'ChatPermissions' },
    [GameCommand.Concede]: {
        does: 'ends the game, with the opponent the winner',
        runAsync: async (harness) => {
            const { owner, guest } = await harness.startLiveGameAsync();

            await guest.concedeAsync();

            expect(owner.gameState.winners).toEqual([owner.username]);
            expect(guest.gameState.winners).toEqual([owner.username]);
        },
    },
    [GameCommand.MenuButton]: { coveredBy: 'the timer specs, which play through prompts with clickButtonAsync' },
    [GameCommand.PerCardMenuButton]: { toDo: true },
    [GameCommand.RollbackToSnapshot]: { coveredBy: 'ActionTimerPauses and TimedGames (quickUndoAsync); the undo area adds more' },
    [GameCommand.StatefulPromptResults]: { toDo: true },
    [GameCommand.ToggleOptionSetting]: { toDo: true },
};

/** An `it` for each command with a spec here, and a pending one for each still to write. */
function defineCommandSpecs(contextRef: IServerIntegrationContextRef, entries: Record<string, CommandEntry>): void {
    for (const [command, entry] of Object.entries(entries)) {
        if ('runAsync' in entry) {
            it(`${command} ${entry.does}`, async function () {
                await entry.runAsync(contextRef.harness);
            });
        } else if ('toDo' in entry) {
            xit(`${command}: still to write (the protocol-surface area's step c)`);
        }
    }
}

/**
 * The commands a client sends on its socket (\`SocketCommands\`): that each names a method that exists, that each takes
 * effect when sent the way the client sends it, what a spectator may send, and what becomes of a command a channel does
 * not know. The protocol-surface area's rows P1 and P3 to P6. Every command has an entry in the tables above, so a new one
 * fails to compile until it has a spec, a pointer to one, or a place on the list still to write.
 */
describe('Socket commands', function () {
    describe('the command lists', function () {
        // these two read the code rather than the wire: a renamed method would otherwise silently disable its command
        it('name only methods of Lobby', function () {
            const notMethods = Object.values(LobbyCommand).filter((command) => typeof Reflect.get(Lobby.prototype, command) !== 'function');

            expect(notMethods).toEqual([]);
        });

        it('name only methods of Game', function () {
            const notMethods = Object.values(GameCommand).filter((command) => typeof Reflect.get(Game.prototype, command) !== 'function');

            expect(notMethods).toEqual([]);
        });
    });

    serverIntegration(function (contextRef) {
        describe('each lobby command', function () {
            defineCommandSpecs(contextRef, lobbyCommands);
        });

        describe('each game command', function () {
            defineCommandSpecs(contextRef, gameCommands);
        });

        describe('from a spectator', function () {
            it('answers retransmitGameMessages with the game log it was sent', async function () {
                const { harness } = contextRef;
                const { lobbyId, owner, guest } = await harness.startLiveGameAsync();
                await harness.playThroughSetupAsync(owner, guest);
                const spectator = harness.createClient({ authenticated: true });
                expect((await spectator.spectateGameAsync(lobbyId)).status).toBe(200);
                await spectator.connectAsync({ spectator: true });
                const sent = spectator.receivedEvents('gamestate').flatMap((e) => e.args[0].newMessages);
                expect(sent.length).toBeGreaterThan(0);

                await spectator.retransmitGameMessagesAsync(0, sent.length);

                const responses = spectator.receivedEvents('retransmitResponse');
                expect(responses.length).toBe(1);
                expect(responses[0].args[0]).toEqual({ messages: sent, startIndex: 0, totalCount: sent.length });
            });

            xit('ignores every other lobby and game command (the protocol-surface area\'s step c)');
        });

        describe('a command the channel does not know', function () {
            it('is ignored on the lobby channel, even when it names a server-internal method', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true });

                // would empty the lobby's user list if it ran
                await owner.sendLobbyMessageAsync('cleanLobby');
                await guest.sendChatMessageAsync('still here');

                expect(owner.lobbyChatFrom(guest)).toEqual(['still here']);
            });

            it('is ignored on the game channel, even when it names a server-internal method', async function () {
                const { harness } = contextRef;
                const { first: player, second: opponent } = await harness.startQuickGameAsync();

                // would add to an arbitrary field on the player and log "sets allowlistProbe to ..." if it ran
                await player.sendGameMessageAsync('changeStat', 'allowlistProbe', 5);

                expect(opponent.gameChat.some((entry) => entry.text.includes('allowlistProbe'))).toBeFalse();
            });
        });
    });
});
