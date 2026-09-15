import { GameEndReason, PhaseName, SnapshotType } from '../../../../server/game/core/Constants';
import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../../../server/game/core/stateSerialization/MatchLoader';
import { UndoMode } from '../../../../server/game/core/snapshot/SnapshotManager';
import { buildLoadConfig } from '../../../helpers/MatchLoaderHarness';
import { wrapLoadedGame } from '../../../helpers/SaveLoadHarness';

/**
 * P2-D server plumbing: `Game.armedSave` (`GameInterfaces.ts`) and `ActionWindow`'s per-instance
 * `boundaryFired` latch. `onFired`/`onCleared` are reassigned directly on `context.game.armedSave` for
 * injection -- `GameFlowWrapper` builds `Game` with no callback passthrough, so this is the only feasible
 * seam against the unmodified harness (see `IArmedSaveSurface`'s own doc comment).
 *
 * Drift assertion (`P2D-R0-01`'s direct regression test): the latch reads no `snapshotManager` state, so
 * it must behave identically under both `npm run test-parallel` (this file's `integration()` default,
 * `UndoMode.Disabled`) and `npm run test-parallel-undo` (`ENABLE_UNDO_ALL_TESTS` rebinds `global.it` to
 * `undoIt` and forces every `integration()` spec to `UndoMode.Free`, replaying this same body after a
 * rollback to the pre-test snapshot -- see `IntegrationHelper.js`). No separate "forced `enableUndo:
 * false`" variant is added: under the undo sweep, `integration()`'s second argument is dropped entirely,
 * so such a variant cannot actually pin the mode (corrected per implementation review finding
 * `P2D-R1-06`, which found the plan's own prior claim here backwards).
 */
describe('Game.armedSave', function() {
    integration(function(contextRef) {
        it('takes an immediate save when requested with nothing queued at the action-window boundary', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            const game = context.game;

            expect(game.getCurrentOpenPrompt()).toBe(game.currentActionWindow);

            const outcome = game.armedSave.request();
            expect(outcome).toEqual({
                kind: 'immediate',
                requestedAtActionNumber: game.actionNumber,
                requestedAtPhase: PhaseName.Action,
            });
        });

        it('arms mid-resolution and fires at the next action-window boundary with drift exactly one action', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['strike-true'], groundArena: ['wampa', 'battlefield-marine'] },
                player2: { groundArena: ['specforce-soldier'] },
            });
            const { context } = contextRef;
            const game = context.game;

            const onFired = jasmine.createSpy('onFired');
            game.armedSave.onFired = onFired;

            // Mid-resolution: Strike True's own friendly-unit SelectCardPrompt is open, so the open
            // prompt is not the action window itself -- the "already at a boundary" fast path must not apply.
            context.player1.clickCard(context.strikeTrue);
            expect(game.getCurrentOpenPrompt()).not.toBe(game.currentActionWindow);

            const requestedAtActionNumber = game.actionNumber;
            const outcome = game.armedSave.request();
            expect(outcome).toEqual({ kind: 'armed' });
            expect(onFired).not.toHaveBeenCalled();

            // Finish resolving Strike True (friendly unit, then enemy target); this completes the
            // current action and the pipeline immediately opens the next action window, whose first
            // `continue()` fires the latch.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.specforceSoldier);

            expect(onFired).toHaveBeenCalledOnceWith({ requestedAtActionNumber, requestedAtPhase: PhaseName.Action });
            expect(game.actionNumber).toBe(requestedAtActionNumber + 1);
        });

        it('coalesces a second request while one is already armed, keeping the first trigger', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['strike-true'], groundArena: ['wampa'] },
                player2: { groundArena: ['specforce-soldier'] },
            });
            const { context } = contextRef;
            const game = context.game;

            const onFired = jasmine.createSpy('onFired');
            game.armedSave.onFired = onFired;

            context.player1.clickCard(context.strikeTrue);
            const firstRequestActionNumber = game.actionNumber;
            expect(game.armedSave.request()).toEqual({ kind: 'armed' });

            context.player1.clickCard(context.wampa);
            // Still mid-resolution (choosing the enemy target): a second request coalesces rather than
            // overwriting the first trigger's recorded action number.
            expect(game.armedSave.request()).toEqual({ kind: 'armed' });

            context.player1.clickCard(context.specforceSoldier);

            expect(onFired).toHaveBeenCalledOnceWith({ requestedAtActionNumber: firstRequestActionNumber, requestedAtPhase: PhaseName.Action });
        });

        it('refuses a request outside the action phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
            });
            const { context } = contextRef;
            const game = context.game;

            // Exercises the phase check in isolation, independent of any particular route into a
            // non-action phase -- the driven "clear on phase exit" case below covers a real transition.
            game.currentPhase = PhaseName.Regroup;
            try {
                expect(game.armedSave.request()).toEqual({ kind: 'refused' });
            } finally {
                game.currentPhase = PhaseName.Action;
            }
        });

        it('clears an armed request on exit from the action phase, without firing it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['strike-true'], groundArena: ['wampa'] },
                player2: { groundArena: ['specforce-soldier'] },
            });
            const { context } = contextRef;
            const game = context.game;

            const onFired = jasmine.createSpy('onFired');
            const onCleared = jasmine.createSpy('onCleared');
            game.armedSave.onFired = onFired;
            game.armedSave.onCleared = onCleared;

            context.player1.clickCard(context.strikeTrue);
            expect(game.armedSave.request()).toEqual({ kind: 'armed' });

            // Deliberately leaves Strike True's target-selection prompt unresolved -- this test only
            // cares about the currentPhase-setter clear condition, not driving the action to completion.
            context.ignoreUnresolvedActionPhasePrompts = true;
            game.currentPhase = PhaseName.Regroup;

            expect(onCleared).toHaveBeenCalledTimes(1);
            expect(onFired).not.toHaveBeenCalled();
        });

        it('clears an armed request on game end, without firing it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['strike-true'], groundArena: ['wampa'] },
                player2: { groundArena: ['specforce-soldier'] },
            });
            const { context } = contextRef;
            const game = context.game;

            const onFired = jasmine.createSpy('onFired');
            const onCleared = jasmine.createSpy('onCleared');
            game.armedSave.onFired = onFired;
            game.armedSave.onCleared = onCleared;

            context.player1.clickCard(context.strikeTrue);
            expect(game.armedSave.request()).toEqual({ kind: 'armed' });

            // As above: leaves the target-selection prompt unresolved on purpose.
            context.ignoreUnresolvedActionPhasePrompts = true;
            game.endGame(context.player1Object, GameEndReason.GameRules);

            expect(onCleared).toHaveBeenCalledTimes(1);
            expect(onFired).not.toHaveBeenCalled();
        });

        // P2E-AC7: `02-semantic-save-load.md:790-792` enumerates "mid-prompt and mid-attack" as the two
        // mid-resolution sub-cases. The mid-prompt case is already covered above (Strike True's own
        // SelectCardPrompt); this drives the attack-resolution branch specifically, with a card whose own
        // On-Attack ability opens a prompt during attack resolution.
        it('arms mid-attack-resolution and fires at the next action-window boundary with drift exactly one action', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['fifth-brother#fear-hunter', 'wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            const game = context.game;

            const onFired = jasmine.createSpy('onFired');
            game.armedSave.onFired = onFired;

            // Declares the attack; Fifth Brother's optional On-Attack ability opens a SelectCardPrompt
            // (another ground unit to damage), so the open prompt is mid-attack-resolution, not the action
            // window itself -- exactly the branch `Game.ts:419-429` shares with the mid-prompt case above.
            context.player1.clickCard(context.fifthBrotherFearHunter);
            context.player1.clickCard(context.battlefieldMarine);
            expect(game.getCurrentOpenPrompt()).not.toBe(game.currentActionWindow);

            const requestedAtActionNumber = game.actionNumber;
            expect(game.armedSave.request()).toEqual({ kind: 'armed' });
            expect(onFired).not.toHaveBeenCalled();

            // Resolve the optional damage-another-unit half of the ability: accept the "may trigger"
            // confirmation, then pick the other ground unit to damage.
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.wampa);

            expect(onFired).toHaveBeenCalledOnceWith({ requestedAtActionNumber, requestedAtPhase: PhaseName.Action });
            expect(game.actionNumber).toBe(requestedAtActionNumber + 1);
        });

        // P2E-AC8: `MatchLoader.ts:219` builds the loaded game with `undoMode: saved.settings.undoMode`,
        // and `SavedMatchValidator` does not gate that field -- the only route to a genuinely
        // undo-disabled live game under `ENABLE_UNDO_ALL_TESTS`, where `integration()`'s second argument
        // (that would otherwise pin `UndoMode.Disabled`) is dropped entirely.
        it('fires for a game whose undoMode is pinned to Disabled via a loaded document, in both gating suites', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                // Two friendly and two enemy ground units: the loaded seats default `autoSingleTarget:
                // true` (`getUserWithDefaultsSet`, unlike this harness's own `setupTestAsync`), which
                // auto-resolves a target-selection prompt with exactly one legal choice -- collapsing
                // Strike True's whole two-target ability into zero real clicks and never actually arming.
                player1: { hand: ['strike-true'], groundArena: ['wampa', 'kachirho-militia'] },
                player2: { groundArena: ['specforce-soldier', 'battlefield-marine'] },
            });
            const { context } = contextRef;

            const document = save(context.game);
            document.settings.undoMode = UndoMode.Disabled;
            const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));

            expect(loadedGame.snapshotManager.undoMode).toBe(UndoMode.Disabled);
            // The control that makes this case meaningful: the snapshot-derived signal a naive hook might
            // have used instead is unconditionally absent in this mode. `SnapshotFactory.ts`'s own getter
            // is typed `number | null` but its optional-chained implementation actually yields `undefined`
            // when nothing has been snapshotted -- a pre-existing type/runtime mismatch, not this test's
            // concern; `toBeUndefined()` matches the real value.
            expect(loadedGame.snapshotManager.currentSnapshottedAction).toBeUndefined();

            const onFired = jasmine.createSpy('onFired');
            loadedGame.armedSave.onFired = onFired;

            const activePlayerSeat = document.game.actionPhaseActivePlayer;
            const loadedWrappers = wrapLoadedGame(loadedGame, playersBySeat);
            const loadedActive = activePlayerSeat === 'p1' ? loadedWrappers.p1 : loadedWrappers.p2;

            loadedActive.clickCard(loadedActive.findCardByName('strike-true'));
            expect(loadedGame.getCurrentOpenPrompt()).not.toBe(loadedGame.currentActionWindow);

            const requestedAtActionNumber = loadedGame.actionNumber;
            expect(loadedGame.armedSave.request()).toEqual({ kind: 'armed' });
            expect(onFired).not.toHaveBeenCalled();

            // Strike True's own two target selections (friendly unit, then enemy unit) are both the active
            // player's own clicks, resolving the same ability -- not a turn change. The enemy target is
            // resolved through the *opponent's* wrapper: `findCardByName` with no `side` searches only
            // `this.player.decklist.allCards` (`PlayerInteractionWrapper.ts:598-605`), so `loadedActive`
            // alone can never resolve a card it does not own.
            const loadedOpponent = loadedActive === loadedWrappers.p1 ? loadedWrappers.p2 : loadedWrappers.p1;
            loadedActive.clickCard(loadedActive.findCardByName('wampa'));
            loadedActive.clickCard(loadedOpponent.findCardByName('specforce-soldier'));

            expect(onFired).toHaveBeenCalledOnceWith({ requestedAtActionNumber, requestedAtPhase: PhaseName.Action });
            expect(loadedGame.actionNumber).toBe(requestedAtActionNumber + 1);
        });
    });

    // P2D-R0-02's direct regression test: rollback replaces `game.state` wholesale, bypassing the
    // `currentPhase` setter above, so the clear here must come from `postRollbackOperations` instead.
    // `undoIntegration` (not `integration`): only this mode gives a real, working `rollbackToSnapshot`
    // (`Game.isUndoEnabled` gates on `undoMode`). Per implementation review finding `P2D-R1-06`, this case
    // therefore runs under `npm run test-parallel` (where `undoIntegration` runs for real, at
    // `UndoMode.Free`) and is deliberately skipped under `npm run test-parallel-undo` (where
    // `undoIntegration` bodies are replaced with a pending `xit`, since the whole suite already runs
    // every ordinary spec through a rollback replay there).
    undoIntegration(function(contextRef) {
        it('clears an armed request across a rollback instead of replaying it into a later boundary', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['strike-true'], groundArena: ['wampa'] },
                player2: { groundArena: ['specforce-soldier'] },
            });
            const { context } = contextRef;
            const game = context.game;

            const snapshotId = game.takeManualSnapshot(context.player1Object);

            context.player1.clickCard(context.strikeTrue);

            const onFired = jasmine.createSpy('onFired');
            const onCleared = jasmine.createSpy('onCleared');
            game.armedSave.onFired = onFired;
            game.armedSave.onCleared = onCleared;

            expect(game.armedSave.request()).toEqual({ kind: 'armed' });

            const rolledBack = contextRef.snapshot.rollbackToSnapshot(
                { type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId },
                context.player1Object.id
            );
            expect(rolledBack).toBeTrue();

            expect(onCleared).toHaveBeenCalledTimes(1);
            expect(onFired).not.toHaveBeenCalled();

            // The replayed timeline reaching a real, later boundary must not fire a save carrying the
            // stale pre-rollback trigger.
            onFired.calls.reset();
            onCleared.calls.reset();
            context.player1.clickCard(context.strikeTrue);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.specforceSoldier);
            expect(onFired).not.toHaveBeenCalled();
        });
    });
});
