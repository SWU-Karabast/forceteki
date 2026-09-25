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

        describe('When the same card leaves play twice in one action', function () {
            it('keeps a separate record per incarnation, so a trigger reads the one it fired on', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        // The Experience tokens are only there to keep HK-47 alive under the two
                        // enemy Snokes, which would otherwise shrink it to 0 HP.
                        groundArena: [{ card: 'hk47#exclamation-die-meatbag', upgrades: ['experience', 'experience'] }],
                        resources: 10
                    },
                    player2: {
                        groundArena: [
                            // Owned by player1 but controlled by player2, so its Bounty replays it
                            // under player1's control.
                            { card: 'stolen-landspeeder', owner: 'player1' },
                            'supreme-leader-snoke#shadow-ruler',
                            'supreme-leader-snoke#shadow-ruler'
                        ],
                        resources: 10
                    }
                });

                const { context } = contextRef;
                const landspeeder = context.stolenLandspeeder;

                expect(landspeeder.controller).toBe(context.player2.player);

                // First defeat, while player2 controls it.
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(landspeeder);

                // Both triggers belong to player1, so player1 picks the order. Resolving the Bounty
                // first replays the Landspeeder under player1's control with an Experience token,
                // where player2's two Snokes (-4/-4) immediately defeat it again. That writes a
                // second record for the same physical card, before HK-47 has resolved.
                context.player1.clickPrompt('Collect Bounty: If you own this unit, play it from your discard pile for free and give an Experience token to it');
                context.player1.clickPrompt('Trigger');
                context.player2.clickPrompt('Pass');

                expect(landspeeder).toBeInZone('discard', context.player1);

                // HK-47 deals 1 damage to "its controller's base", read from the record of the
                // incarnation it triggered on — the one player2 controlled. If the second record had
                // overwritten the first, the damage would land on player1's base instead, because
                // player1 controlled the replayed copy.
                expect(context.player2.base.damage).toBe(1);
                expect(context.player1.base.damage).toBe(0);
            });
        });

        describe('When a defeat is replaced so the unit survives', function () {
            it('does not leave a stale record behind for the surviving unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chewbacca#faithful-first-mate']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                // Chewbacca can't be defeated by enemy card abilities, so this defeat never
                // resolves and he stays in play.
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.chewbacca);
                expect(context.chewbacca).toBeInZone('groundArena', context.player1);

                // No record may be left behind for him. A record would make later readings of his
                // characteristics report the abandoned defeat's values, and would leave a tombstone
                // that turns reads after the next action boundary into errors.
                const properties = registry.getProperties(registry.refFor(context.chewbacca));
                expect(properties.asUnit().isInPlay()).toBe(true);
                expect(properties.asUnit().asInPlay().power).toBe(context.chewbacca.getPower());

                // The tombstone check is the sharper assertion: it survives the action boundary,
                // where a leaked record would have been flushed and would then throw on read.
                context.player1.passAction();
                context.player2.passAction();

                const afterActionBoundary = registry.getProperties(registry.refFor(context.chewbacca));
                expect(afterActionBoundary.asUnit().asInPlay().power).toBe(context.chewbacca.getPower());
            });
        });

        describe('When a card moves from a visible zone into a hidden one', function () {
            it('records its state first, because it becomes a new copy', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['renewed-friendship'],
                        discard: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                // Capture a reference to Wampa while it is still sitting in the discard pile.
                const beforeMove = registry.refFor(context.wampa);

                context.player1.clickCard(context.renewedFriendship);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand', context.player1);

                // Moving discard -> hand loses the information the game had about the card, so it is
                // now a new copy and the old reference no longer names the live card.
                expect(registry.refFor(context.wampa)).not.toBe(beforeMove);
                expect(registry.deref(beforeMove)).toBeNull();

                // Its state was recorded before the move, so the old reference does not become an
                // orphan. Once the action ends that record is flushed and the tombstone left behind
                // reports the reference as expired rather than letting it fall back to live state.
                expect(() => registry.getProperties(beforeMove))
                    .toThrowError(/was flushed at an action boundary/);
            });
        });

        describe('When a defeat is cancelled mid-window by another event in the same window', function () {
            it('does not leave a record behind for the cancelled defeat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'the-armorer#steel-shapes-us',
                        hand: ['kelnacca#solitary-master'],
                        resources: 11
                    },
                    player2: {
                        groundArena: [{ card: 'atte-vanguard', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                // The action-boundary flush clears staged records as well as committed ones, so
                // sample the staged count as each window finishes rather than at the end.
                let maxPendingAfterWindowCleanup = 0;
                const flushRecords = registry.flushRecords.bind(registry);
                spyOn(registry, 'flushRecords').and.callFake(() => {
                    maxPendingAfterWindowCleanup = Math.max(maxPendingAfterWindowCleanup, registry.pendingEventCount);
                    flushRecords();
                });

                // Kelnacca deals two simultaneous damage instances at the same unit, so both
                // generate a defeat for its single Shield token in one window. The first resolves;
                // the second is cancelled by `checkCondition` because the Shield has already left
                // play. Both staged a record at `preResolutionEffects`.
                context.player1.clickCard(context.kelnacca);
                context.player1.chooseListOption('6');
                context.player1.clickCardNonChecking(context.atteVanguard);
                context.player1.clickCardNonChecking(context.atteVanguard);

                expect(context.atteVanguard).toHaveExactUpgradeNames([]);
                expect(context.atteVanguard.damage).toBe(0);

                // The cancelled defeat's staged record must not survive its window. If it did, the
                // next event to reach a commit would promote it, and the Shield would report a
                // defeat that never happened.
                expect(maxPendingAfterWindowCleanup).toBe(0);
                expect(registry.pendingEventCount).toBe(0);
            });
        });

        describe('When a card takes damage it survives', function () {
            it('leaves no record behind, so later reads still see the live card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['helgait#dooku-was-a-visionary'],
                        resources: 10
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['daring-raid'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Daring Raid deals 2 damage; Helgait is 6/4, so it survives.
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.helgait);
                expect(context.helgait.damage).toBe(2);
                expect(context.helgait).toBeInZone('groundArena');

                // Every non-base damage event captures last known information. If that capture also
                // wrote a registry record, this still-live unit would answer with its pre-damage
                // values for the rest of the action, and the action boundary would then tombstone
                // its current incarnation — turning the read below into a hard crash.
                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.helgait);

                expect(context.player1).toHavePrompt('Distribute 6 Advantage tokens among targets');
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.helgait, 6]
                ]));

                expect(context.helgait.getPower()).toBe(12);
            });
        });

        describe('Record lifecycle', function () {
            it('flushes the record at the action boundary and refuses stale reads afterwards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                // The action that caused the defeat has now ended, so the record has been flushed.
                // The tombstone left behind turns a stale read into a loud error rather than a
                // silent fall back to live state — which for a card in the discard pile would
                // report the wrong zone and would throw outright for in-play-only characteristics.
                expect(() => registry.getProperties(registry.refFor(context.wampa)))
                    .toThrowError(/was flushed at an action boundary/);
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
