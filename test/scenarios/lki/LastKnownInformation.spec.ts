/**
 * Baseline characterization tests for "last known information" (LKI) behavior.
 *
 * These lock in the CURRENT behavior of the engine before the LKI registry refactor, so that the
 * refactor can be validated as behavior-preserving. See design/lki-redesign-decisions-and-insights.md
 * (phase 0 of the migration plan) for context.
 *
 * The scenarios here exercise cases where a card's last known information is read more than once
 * within a single action, and the two reads could disagree.
 */

describe('Last known information', function () {
    integration(function (contextRef) {
        describe('When a "When Defeated" ability is used while its source is still in play', function () {
            it('reads the source\'s current power, including modifiers gained earlier in the action', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['helgait#dooku-was-a-visionary']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Chimaera uses Helgait's "When Defeated" without defeating it, so Helgait stays in play.
                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.helgait);

                // Helgait's printed power is 6 and it has no modifiers yet.
                expect(context.player1).toHavePrompt('Distribute 6 Advantage tokens among targets');

                // Stack every Advantage token onto Helgait itself, taking it from 6 power to 12.
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.helgait, 6]
                ]));

                expect(context.helgait.getPower()).toBe(12);
            });
        });

        describe('When the same "When Defeated" ability is used twice in one action', function () {
            it('takes a fresh reading each time, when the source stays in play between uses', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['helgait#dooku-was-a-visionary']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.helgait);

                // First reading: Helgait's printed power.
                expect(context.player1).toHavePrompt('Distribute 6 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.helgait, 6]
                ]));
                expect(context.helgait.getPower()).toBe(12);

                // Thrawn offers to run the same ability again, now that Helgait is stronger.
                context.player1.clickPrompt('Trigger');

                // Second reading must reflect the Advantage tokens gained since the first reading.
                expect(context.player1).toHavePrompt('Distribute 12 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.chimaera, 12]
                ]));

                expect(context.player2).toBeActivePlayer();
            });

            it('reuses the same last known information when the source was actually defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#how-unfortunate',
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['experience'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);

                // Printed power 6 + 1 from the Experience token, captured before Helgait left play.
                expect(context.player1).toHavePrompt('Distribute 7 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 7]
                ]));

                // Thrawn runs the ability again. Helgait is in the discard pile, so the second reading
                // must come from the same snapshot as the first.
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHavePrompt('Distribute 7 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 7]
                ]));

                expect(context.wampa).toHaveExactUpgradeNames([
                    'advantage', 'advantage', 'advantage', 'advantage', 'advantage', 'advantage', 'advantage',
                    'advantage', 'advantage', 'advantage', 'advantage', 'advantage', 'advantage', 'advantage'
                ]);
            });
        });

        describe('Trigger conditions that read in-play-only state', function () {
            it('are evaluated before the defeat resolves, not after', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        spaceArena: [{ card: 'punishing-one#dengars-jumpmaster', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }]
                    }
                });

                const { context } = contextRef;

                // Punishing One's trigger condition reads isInPlay() and isUpgraded() on the defeated
                // card. Once the defeat resolves, Wampa is in the discard pile and its Experience token
                // has gone with it, so both would be false. The trigger firing is what proves the
                // condition is evaluated against pre-defeat state.
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                context.player1.clickPrompt('Trigger');
                expect(context.punishingOne.exhausted).toBe(false);
            });
        });

        describe('When a unit is actually defeated', function () {
            it('reads the power it had immediately before leaving play, including modifiers', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['experience'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);

                // Printed power 6 + 1 from the Experience token, captured before Helgait left play.
                expect(context.player1).toHavePrompt('Distribute 7 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 7]
                ]));

                expect(context.helgait).toBeInZone('discard');
            });
        });
    });
});
