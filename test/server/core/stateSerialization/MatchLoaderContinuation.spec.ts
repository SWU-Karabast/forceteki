import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../../../server/game/core/stateSerialization/MatchLoader';
import { buildLoadConfig } from '../../../helpers/MatchLoaderHarness';

/**
 * Establishes `P2-C2`'s continuation acceptance criteria: a loaded game must be playable, and must recover
 * states `test/helpers/GameStateBuilder.js` (whose only entry point is a fresh setup) cannot reach at all --
 * a later round with the non-initiative player active, restored per-copy limits, and a spent epic deploy.
 */
describe('MatchLoader.loadAsync — continuation', function() {
    integration(function(contextRef) {
        it('AC2 — the loaded game prompts the saved active player and plays on correctly', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['atat-suppressor'],
                    resources: 3,
                },
                player2: {
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;

            const document = save(context.game);
            const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));

            const activePlayer = playersBySeat.get(document.game.actionPhaseActivePlayer);
            expect(activePlayer.currentPrompt().menuTitle).toContain('Choose an action');

            const attacker = loadedGame.findAnyCardsInPlay((c) => c.internalName === 'atat-suppressor')[0] as any;
            const target = loadedGame.findAnyCardsInPlay((c) => c.internalName === 'wampa')[0] as any;
            expect(attacker).toBeDefined();
            expect(target).toBeDefined();

            loadedGame.cardClicked(activePlayer.id, attacker.uuid);
            loadedGame.continue();
            loadedGame.cardClicked(activePlayer.id, target.uuid);
            loadedGame.continue();

            // AT-AT Suppressor's power is high enough to defeat Wampa outright in one hit, so "the attack
            // resolved" is asserted by the target leaving play, rather than by a `damage` read that would
            // itself assert-fail once the target zone no longer enables that property.
            expect(target.zoneName).toBe('discard');
        });

        it('AC3 — a later round with the non-initiative player active loads with matching round/active-player/prompt', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {},
                player2: {},
            });
            const { context } = contextRef;

            const document = save(context.game);
            document.game.roundNumber = 3;
            document.game.actionPhaseActivePlayer = document.game.initiativePlayer === 'p1' ? 'p2' : 'p1';

            const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));

            expect(loadedGame.roundNumber).toBe(3);
            const expectedActivePlayer = playersBySeat.get(document.game.actionPhaseActivePlayer);
            expect(loadedGame.actionPhaseActivePlayer).toBe(expectedActivePlayer);
            expect(expectedActivePlayer.currentPrompt().menuTitle).toContain('Choose an action');
        });

        it('AC4 — per-copy ability limits are restored per instance, not per card name', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['kachirho-militia', 'kachirho-militia'],
                },
            });
            const { context } = contextRef;
            const [usedCopy, unusedCopy] = context.player1.findCardsByName('kachirho-militia');
            const usedAbility = usedCopy.getTriggeredAbilities().find((a) => a.printedAbility);
            usedAbility.limit.increment(context.player1Object);

            const document = save(context.game);
            const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));

            const loadedCopies = loadedGame.findAnyCardsInPlay((c) => c.internalName === 'kachirho-militia');
            expect(loadedCopies.length).toBe(2);
            const p1 = playersBySeat.get('p1');
            const atMax = (card: any) => card.getTriggeredAbilities().find((a) => a.printedAbility)?.limit.isAtMax(p1);
            const loadedUsed = loadedCopies.find((c) => atMax(c));
            const loadedUnused = loadedCopies.find((c) => c !== loadedUsed);

            // The defect this test exists to catch: restoring the per-copy limit onto the wrong (or both)
            // instances. Asserting only that *a* copy is at max passes even when both copies wrongly ended
            // up at max, since `loadedUnused` is then merely "the other one found", still defined and never
            // checked for NOT being at max. Both conditions must hold for the restore to be per-instance.
            expect(loadedUsed).toBeDefined();
            expect(loadedUnused).toBeDefined();
            expect(atMax(loadedUnused)).toBeFalse();
            void usedCopy;
            void unusedCopy;
        });

        describe('AC5 — epicDeployUsed', function() {
            it('a deployed leader whose epic deploy was spent loads deployed, at max, without a double count', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { leader: { card: 'emperor-palpatine#galactic-ruler' } },
                });
                const { context } = contextRef;
                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickPrompt('Deploy Emperor Palpatine');

                const document = save(context.game);
                const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));
                const p1 = playersBySeat.get('p1');
                const loadedLeader = p1.deckLeader as any;

                expect(loadedLeader.deployed).toBeTrue();
                expect(loadedLeader.deployEpicActionLimit.isAtMax(p1)).toBeTrue();

                const reSaved = save(loadedGame);
                expect(reSaved.players[0].leader.epicDeployUsed).toBeTrue();
                expect(reSaved.players[0].leader.limits.some((l) => 'usesByPlayer' in l || 'useCount' in l)).toBeFalse();
            });
        });

        it('AC7 — passedActionPhase is derived from isInitiativeClaimed and initiativePlayer, not restored directly', async function() {
            await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
            const { context } = contextRef;

            const document = save(context.game);
            document.game.isInitiativeClaimed = true;
            document.game.prevActionPhasePlayerPassed = true;

            const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));
            const initiativePlayer = playersBySeat.get(document.game.initiativePlayer);
            const opponent = [...playersBySeat.values()].find((p) => p !== initiativePlayer);

            expect(initiativePlayer.passedActionPhase).toBeTrue();
            expect(opponent.passedActionPhase).toBeFalse();
            // Written directly at 5.6 (not derived), unlike passedActionPhase above -- assert it actually
            // survived the load rather than merely being set on the document.
            expect(loadedGame.prevActionPhasePlayerPassed).toBeTrue();
        });

        it('AC6 — a watcher-reading card behaves the same after load, and an absent optional member decodes to undefined', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['atat-suppressor'] },
                player2: { groundArena: ['wampa'] },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.atatSuppressor);
            context.player1.clickCard(context.wampa);

            const document = save(context.game);
            const attackEntry = document.stateWatchers.find((s) => s.watcher === 'attacksThisPhase')?.entries[0] as any;
            expect(attackEntry).toBeDefined();
            expect(attackEntry.targetInPlayId).toBeNull();

            const { game: loadedGame, playersBySeat } = await loadAsync(document, buildLoadConfig(context));

            const attacksWatcher = (loadedGame.abilityHelper.stateWatchers as any).attacksThisPhase();
            const loadedAttacker = loadedGame.findAnyCardsInPlay((c) => c.internalName === 'atat-suppressor')[0];
            expect(attacksWatcher.cardDidAttack(loadedAttacker)).toBeTrue();

            const rawEntry = (attacksWatcher as any).rawEntries[0];
            expect(rawEntry.targetInPlayId).toBeUndefined();
            void playersBySeat;
        });
    });
});
