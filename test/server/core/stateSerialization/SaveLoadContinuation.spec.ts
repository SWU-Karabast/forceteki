import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../../../server/game/core/stateSerialization/MatchLoader';
import { StateWatcherName } from '../../../../server/game/core/Constants';
import { buildLoadConfig } from '../../../helpers/MatchLoaderHarness';
import { expectContinuationMatchesOriginalAsync, saveLoadSaveAsync, wrapLoadedGame } from '../../../helpers/SaveLoadHarness';

/**
 * `P2-E` group 2 (AC4): the eight continuation scenarios `02-semantic-save-load.md` requires, each against
 * a save whose `engineOnlyFacts` is asserted empty first. Six of eight use the differential oracle
 * (`expectContinuationMatchesOriginalAsync`) -- the property the plan doc actually specifies ("asserting
 * identical outcomes to the unloaded original"). Scenarios 7 and 8 are about post-load *availability*,
 * which a replayed sequence cannot express, and keep targeted assertions instead; see
 * `.anvil/p2-e/plan-rev1.md` §3 step 3 for the full derivation of each.
 */
describe('Save -> load -> continue', function() {
    integration(function(contextRef) {
        it('scenario 1 — attack, play a unit, and use a triggered ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['atat-suppressor', 'kachirho-militia'],
                    resources: 5,
                },
                player2: {
                    // Two non-Sentinel units, so the attack below has a genuine two-way choice: a lone
                    // legal target would auto-resolve on the loaded side (its seats default
                    // `autoSingleTarget: true` via `getUserWithDefaultsSet`, unlike this harness's own
                    // `setupTestAsync`), making a single click on the attacker complete the whole
                    // attack there but not on the unloaded side -- a click-count divergence this
                    // differential sequence must not depend on.
                    groundArena: ['battlefield-marine', 'specforce-soldier'],
                },
            });
            const { context } = contextRef;

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);

            await expectContinuationMatchesOriginalAsync(context, {
                // Zones are explicit throughout: a default filler deck can include a second copy of a
                // common card name in hand, and `findCardByName`'s default `zones: 'any'` could then
                // resolve to the wrong instance.
                sequence: (p1, p2) => {
                    p1.clickCard(p1.findCardByName('atat-suppressor', 'groundArena'));
                    p1.clickCard(p2.findCardByName('battlefield-marine', 'groundArena'));
                    p2.passAction();
                    p1.clickCard(p1.findCardByName('wampa', 'hand'));
                    // Kachirho Militia's own triggered ability: an enemy ground unit attacking the base
                    // readies it -- exercised for real, not by hand-mutating a watcher entry.
                    p2.clickCard(p2.findCardByName('specforce-soldier', 'groundArena'));
                    p2.clickCard(p1.base);
                },
            });
        });

        it('scenario 2 — claim initiative after load', async function() {
            await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
            const { context } = contextRef;

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);

            // "Claim Initiative" is available to whichever player is currently active, gated only on
            // `!game.isInitiativeClaimed` (`ActionWindow.ts:158-161`) -- not on who nominally "has"
            // initiative. Player1 is active first in a fresh, un-pinned setup. A single claim (rather than
            // a pass followed by a claim) is used deliberately: two consecutive pass-equivalent actions
            // end the action phase and drive both games into a real regroup-phase card draw, which is a
            // materially different (and separately worth covering) transition from what this scenario is
            // about -- see this suite's own note in CHOSEN VALUES.
            const result = await expectContinuationMatchesOriginalAsync(context, {
                sequence: (p1) => {
                    p1.clickPrompt('Claim Initiative');
                },
            });

            // passedActionPhase is derived at load time, not stored on the document, so the document-level
            // compare above cannot see it: assert it directly against the live players of both games.
            const loadedP1 = result.playersBySeat.get('p1');
            const loadedP2 = result.playersBySeat.get('p2');
            expect(loadedP1.passedActionPhase).toBe(context.player1Object.passedActionPhase);
            expect(loadedP2.passedActionPhase).toBe(context.player2Object.passedActionPhase);
        });

        it('scenario 3 — a save taken after initiative was claimed in play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {},
                // Padded well past Battlefield Marine's printed cost (2): leader/base are unpinned, so it
                // can carry a full off-aspect penalty.
                player2: { hand: ['battlefield-marine'], resources: 10 },
            });
            const { context } = contextRef;

            // Player1 is active first in a fresh, un-pinned setup; claiming initiative is their real action.
            context.player1.clickPrompt('Claim Initiative');

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);
            expect(before.game.isInitiativeClaimed).toBeTrue();

            // claimInitiative() passes the claimant (Game.ts's ActionWindow.claimInitiative ->
            // pass(false)), so player2 is the remaining active player. Their action is a real card play,
            // not a pass: two consecutive pass-equivalent actions end the action phase and drive both
            // games into a real regroup-phase card draw, a materially different transition from what this
            // scenario is about -- see this suite's own note in CHOSEN VALUES.
            const result = await expectContinuationMatchesOriginalAsync(context, {
                sequence: (p1, p2) => {
                    p2.clickCard(p2.findCardByName('battlefield-marine', 'hand'));
                },
            });

            const loadedP1 = result.playersBySeat.get('p1');
            const loadedP2 = result.playersBySeat.get('p2');
            expect(loadedP1.passedActionPhase).toBe(context.player1Object.passedActionPhase);
            expect(loadedP2.passedActionPhase).toBe(context.player2Object.passedActionPhase);
        });

        it('scenario 4 — round 2, mid-phase, non-initiative player active', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;

            context.moveToNextActionPhase();
            const initiativePlayer = context.player1Object.hasInitiative() ? context.player1 : context.player2;
            const nonInitiativePlayer = initiativePlayer === context.player1 ? context.player2 : context.player1;
            const nonInitiativeIsPlayer1 = nonInitiativePlayer === context.player1;
            initiativePlayer.passAction();

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);
            expect(before.game.roundNumber).toBe(2);
            expect(before.game.actionPhaseActivePlayer).toBe(nonInitiativeIsPlayer1 ? 'p1' : 'p2');

            // The active player's real card action (an attack), not a pass: a pass here would be the
            // round's second consecutive pass-equivalent action, ending the action phase and driving both
            // games into a real regroup-phase card draw -- a materially different transition from what
            // this scenario is about (see this suite's own note in CHOSEN VALUES).
            const result = await expectContinuationMatchesOriginalAsync(context, {
                sequence: (p1, p2) => {
                    const actor = nonInitiativeIsPlayer1 ? p1 : p2;
                    const target = nonInitiativeIsPlayer1 ? p2 : p1;
                    const actorUnitName = nonInitiativeIsPlayer1 ? 'wampa' : 'battlefield-marine';
                    const targetUnitName = nonInitiativeIsPlayer1 ? 'battlefield-marine' : 'wampa';
                    actor.clickCard(actor.findCardByName(actorUnitName, 'groundArena'));
                    actor.clickCard(target.findCardByName(targetUnitName, 'groundArena'));
                },
            });

            expect(result.loadedGame.roundNumber).toBe(2);
        });

        it('scenario 5 — a watcher-reading card (Vanguard Ace) consumes restored cardsPlayedThisPhase entries', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                // Resources padded well past the two cards' combined cost: leader/base are unpinned here,
                // so either card can carry a full off-aspect penalty.
                player1: { hand: ['vanguard-ace', 'wampa'], resources: 16 },
                player2: {},
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player2.passAction();

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);
            expect(before.stateWatchers.some((section) => section.watcher === StateWatcherName.CardsPlayedThisPhase)).toBeTrue();

            // A dropped or mis-decoded watcher entry changes the Experience count Vanguard Ace's own
            // When Played ability grants, which is part of both documents, so the differential compare is
            // unusually sharp here.
            await expectContinuationMatchesOriginalAsync(context, {
                sequence: (p1) => {
                    p1.clickCard(p1.findCardByName('vanguard-ace'));
                },
            });
        });

        it('scenario 6 — a leader deploy earlier in the same phase survives a round trip via the leader singleton coordinate', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { leader: { card: 'emperor-palpatine#galactic-ruler' } },
                player2: {},
            });
            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickPrompt('Deploy Emperor Palpatine');

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);
            const deployedSection = before.stateWatchers.find((section) => section.watcher === StateWatcherName.LeadersDeployedThisPhase);
            expect(deployedSection?.entries.length).toBe(1);
            expect((deployedSection.entries[0] as any).card).toEqual({
                card: 'emperor-palpatine#galactic-ruler',
                controllerSeat: 'p1',
                zone: 'leader',
                ordinal: 0,
            });

            const result = await expectContinuationMatchesOriginalAsync(context, {
                sequence: (p1, p2) => {
                    p2.passAction();
                },
            });

            // No implemented card reads this watcher today, so the watcher's own API is the only available
            // direct consumer.
            const watcher = (result.loadedGame.abilityHelper.stateWatchers as any).leadersDeployedThisPhase();
            const loadedLeader = result.playersBySeat.get('p1').deckLeader;
            expect(watcher.someLeaderDeployed((entry: any) => entry.card === loadedLeader)).toBeTrue();
        });

        it('scenario 7 — a once-per-round ability used by one copy is, after load, usable only by the other', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    // Exhausted so the printed "Attack" action isn't offered alongside the special action
                    // ability, matching `MagnaguardWingLeader.spec.ts`'s own fixture -- a non-exhausted copy
                    // opens an extra "Choose an ability" disambiguation prompt this test doesn't drive.
                    spaceArena: [{ card: 'magnaguard-wing-leader', exhausted: true }, { card: 'magnaguard-wing-leader', exhausted: true }, 'squadron-of-vultures'],
                    groundArena: ['super-battle-droid', 'b1-security-team'],
                },
                player2: {
                    spaceArena: ['droid-starfighter'],
                },
            });
            const { context } = contextRef;
            const [copyA] = context.player1.findCardsByName('magnaguard-wing-leader');

            // Copy A spends its limit for real, resolving both attacks of the `then` chain.
            context.player1.clickCard(copyA);
            context.player1.clickCard(context.superBattleDroid);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.b1SecurityTeam);
            context.player1.clickCard(context.p2Base);
            context.player2.passAction();

            expect(copyA).not.toHaveAvailableActionWhenClickedBy(context.player1);

            const before = save(context.game);
            expect(before.engineOnlyFacts).toEqual([]);

            const { game: loadedGame, playersBySeat } = await loadAsync(before, buildLoadConfig(context));
            const loadedP1 = playersBySeat.get('p1');
            const loadedWrappers = wrapLoadedGame(loadedGame, playersBySeat);
            const [loadedCopyA, loadedCopyB] = loadedGame.findAnyCardsInPlay((card: any) => card.internalName === 'magnaguard-wing-leader');
            const atMax = (card: any) => card.getActionAbilities().find((a: any) => a.printedAbility)?.limit.isAtMax(loadedP1);
            const loadedUsedCopy = atMax(loadedCopyA) ? loadedCopyA : loadedCopyB;
            const loadedUnusedCopy = loadedUsedCopy === loadedCopyA ? loadedCopyB : loadedCopyA;

            // The defect this test exists to catch: restoring the per-copy limit onto the wrong (or both)
            // instances. `toHaveAvailableActionWhenClickedBy` genuinely clicks the card to observe whether
            // a prompt opens (`CustomMatchers.js`), so the *positive* check below is not a separate,
            // side-effect-free probe -- it is itself the first click of "actually use it", continued
            // immediately after rather than re-clicked from scratch.
            expect(loadedUsedCopy).not.toHaveAvailableActionWhenClickedBy(loadedWrappers.p1);
            expect(loadedUnusedCopy).toHaveAvailableActionWhenClickedBy(loadedWrappers.p1);

            // Continue the ability opened by the assertion above. Squadron of Vultures is the only
            // remaining undamaged droid, so the loaded seat's default `autoSingleTarget: true`
            // (`getUserWithDefaultsSet`, unlike this harness's own `setupTestAsync`) auto-selects it as
            // the droid to attack with -- the next real choice is the attack's own target.
            loadedWrappers.p1.clickCard(loadedWrappers.p2.base);
            expect(loadedUnusedCopy).not.toHaveAvailableActionWhenClickedBy(loadedWrappers.p1);
        });

        it('scenario 8 — a deployed leader and a defeated-then-undeployed leader restore epicDeployUsed without a double count', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'emperor-palpatine#galactic-ruler' },
                    hand: ['takedown'],
                },
                player2: {
                    leader: { card: 'emperor-palpatine#galactic-ruler' },
                },
            });
            const { context } = contextRef;
            // Both players share the same leader name, so no `context.emperorPalpatine`-style property is
            // generated; resolved structurally off each `Player` instead.
            const p1Leader = context.player1Object.deckLeader as any;
            const p2Leader = context.player2Object.deckLeader as any;

            context.player1.clickCard(p1Leader);
            context.player1.clickPrompt('Deploy Emperor Palpatine');
            context.player2.clickCard(p2Leader);
            context.player2.clickPrompt('Deploy Emperor Palpatine');

            // Bring p2's deployed leader (printed HP 10) to exactly 5 remaining HP without defeating it, so
            // Takedown ("defeat a unit with 5 or less remaining HP") has a legal target.
            p2Leader.setDamageForStateInjection(5);
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(p2Leader);

            const { before, loadedGame, playersBySeat, saveAgain } = await saveLoadSaveAsync(context);
            expect(before.engineOnlyFacts).toEqual([]);

            const loadedP1Leader = playersBySeat.get('p1').deckLeader as any;
            const loadedP2Leader = playersBySeat.get('p2').deckLeader as any;
            expect(loadedP1Leader.deployed).toBeTrue();
            expect(loadedP1Leader.deployEpicActionLimit.isAtMax(playersBySeat.get('p1'))).toBeTrue();
            expect(loadedP2Leader.deployed).toBeFalse();
            expect(loadedP2Leader.deployEpicActionLimit.isAtMax(playersBySeat.get('p2'))).toBeTrue();

            const reSaved = saveAgain();
            expect(reSaved.players[0].leader.epicDeployUsed).toBeTrue();
            expect(reSaved.players[1].leader.epicDeployUsed).toBeTrue();
            // The double-count symptom: epicDeployUsed is the only representation of the deploy limit.
            expect(reSaved.players[0].leader.limits.some((l: any) => 'usesByPlayer' in l || 'useCount' in l)).toBeFalse();
            expect(reSaved.players[1].leader.limits.some((l: any) => 'usesByPlayer' in l || 'useCount' in l)).toBeFalse();
            void loadedGame;
        });
    });
});
