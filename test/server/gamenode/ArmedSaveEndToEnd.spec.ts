import { Lobby, MatchmakingType } from '../../../server/gamenode/Lobby';
import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import type { ISavedMatch } from '../../../server/game/core/stateSerialization/SavedMatchInterfaces';

/**
 * `P2-E` group 4 (AC6/AC7/AC9): the armed-save trigger driven through the real `Lobby.submitReport` ->
 * `Game.armedSave` -> `ActionWindow` latch -> `Lobby.onArmedSaveFired` -> `DiscordDispatcher.formatReport`
 * path, against a real `context.game` -- unlike `LobbySaveReportDrain.spec.ts`, which stubs the game
 * entirely. See `.anvil/p2-e/plan-rev1.md` §3 step 6.
 */
describe('Armed save — end to end through Lobby', function() {
    function buildLobby() {
        const discordDispatcher = jasmine.createSpyObj('discordDispatcher', ['formatReport', 'formatAndSendReportAsync', 'formatAndSendServerErrorAsync']);
        // Captures the produced ISavedMatch from formatReport's own 15th argument and forwards it into the
        // return value, so formatAndSendReportAsync also receives a realistic report -- the established
        // `formatReport.and.returnValue({})` stub (`LobbySaveReportDrain.spec.ts:18`) would silently drop
        // the document, which is exactly the failure this capture seam exists to avoid.
        discordDispatcher.formatReport.and.callFake((...args: unknown[]) => ({ savedMatch: args[14] as ISavedMatch | undefined }));
        discordDispatcher.formatAndSendReportAsync.and.resolveTo(true);
        discordDispatcher.formatAndSendServerErrorAsync.and.resolveTo(undefined);

        const lobby = new Lobby(
            'Test Lobby',
            MatchmakingType.PrivateLobby,
            SwuGameFormat.Open,
            GamesToWinMode.BestOfOne,
            CardPool.Unlimited,
            {} as any,
            {} as any,
            null as any,
            discordDispatcher
        );

        return { lobby: lobby as any, discordDispatcher };
    }

    function buildStubSocket(userId: string, username: string) {
        return {
            send: jasmine.createSpy('send'),
            user: { id: userId, getId: () => userId, getUsername: () => username },
        } as any;
    }

    // Flushes the microtask queue enough times for the fire-and-forget `finishReportSubmission(...)
    // .catch(...)` chain started by `onArmedSaveFired` to settle.
    async function flushAsync() {
        for (let i = 0; i < 4; i++) {
            await Promise.resolve();
        }
    }

    integration(function(contextRef) {
        it('AC6 — an immediate save at the action-window boundary is included, with the document\'s own actionNumber stamped', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            const { lobby, discordDispatcher } = buildLobby();
            lobby.game = context.game;
            const settings = lobby.buildGameSettings();
            context.game.armedSave.onFired = settings.onArmedSaveFired;
            context.game.armedSave.onCleared = settings.onArmedSaveCleared;

            const socket = buildStubSocket(context.player1Object.id, context.player1Object.name);
            await lobby.submitReport(socket, 'bugReport', 'immediate save please', null, true);

            expect(socket.send).toHaveBeenCalledOnceWith('bugReportResult', jasmine.objectContaining({ success: true, saveStatus: 'included' }));

            const [sentSavedMatch] = discordDispatcher.formatReport.calls.mostRecent().args.slice(14);
            expect(sentSavedMatch).toBeDefined();
            expect(sentSavedMatch.saveTrigger.kind).toBe('immediate');
            expect(sentSavedMatch.saveTrigger.requestedAtActionNumber).toBe(sentSavedMatch.game.actionNumber);
        });

        it('AC7 — a mid-resolution save request is deferred and fires with drift exactly one action', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['strike-true'], groundArena: ['wampa'] },
                player2: { groundArena: ['specforce-soldier'] },
            });
            const { context } = contextRef;
            const { lobby, discordDispatcher } = buildLobby();
            lobby.game = context.game;
            const settings = lobby.buildGameSettings();
            context.game.armedSave.onFired = settings.onArmedSaveFired;
            context.game.armedSave.onCleared = settings.onArmedSaveCleared;

            // Mid-resolution: Strike True's own target prompt is open, so the request arms instead of
            // completing immediately.
            context.player1.clickCard(context.strikeTrue);

            const socket = buildStubSocket(context.player1Object.id, context.player1Object.name);
            await lobby.submitReport(socket, 'bugReport', 'deferred save please', null, true);

            expect(socket.send).toHaveBeenCalledOnceWith('bugReportResult', jasmine.objectContaining({ success: true, saveStatus: 'pending' }));
            expect(discordDispatcher.formatAndSendReportAsync).not.toHaveBeenCalled();

            // Finish resolving Strike True; this completes the current action and the pipeline opens the
            // next action window, whose first continue() fires the latch.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.specforceSoldier);
            await flushAsync();

            expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(1);
            const [sentSavedMatch] = discordDispatcher.formatReport.calls.mostRecent().args.slice(14);
            expect(sentSavedMatch).toBeDefined();
            expect(sentSavedMatch.saveTrigger.kind).toBe('deferred');
            expect(sentSavedMatch.game.actionNumber - sentSavedMatch.saveTrigger.requestedAtActionNumber).toBe(1);
        });

        it('AC9 — a request outside the action phase is refused end-to-end, with nothing armed and no document produced', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {},
                player2: {},
            });
            const { context } = contextRef;
            const { lobby, discordDispatcher } = buildLobby();
            lobby.game = context.game;
            const settings = lobby.buildGameSettings();
            context.game.armedSave.onFired = settings.onArmedSaveFired;
            context.game.armedSave.onCleared = settings.onArmedSaveCleared;

            context.moveToRegroupPhase();

            const socket = buildStubSocket(context.player1Object.id, context.player1Object.name);
            await lobby.submitReport(socket, 'bugReport', 'refused save please', null, true);

            expect(socket.send).toHaveBeenCalledOnceWith('bugReportResult', jasmine.objectContaining({ success: true, saveStatus: 'unavailable' }));
            const [sentSavedMatch] = discordDispatcher.formatReport.calls.mostRecent().args.slice(14);
            expect(sentSavedMatch).toBeUndefined();

            // No later boundary produces a save either: nothing was armed. `context.nextPhase()` (proxied
            // from `GameFlowWrapper`) completes the regroup phase from here, same as `skipRegroupPhase`.
            context.nextPhase();
            await flushAsync();
            expect(discordDispatcher.formatAndSendReportAsync).toHaveBeenCalledTimes(1);
        });
    });
});
