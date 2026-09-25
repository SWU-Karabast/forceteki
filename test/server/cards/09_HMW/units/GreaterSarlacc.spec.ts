describe('Greater Sarlacc', function() {
    integration(function(contextRef) {
        describe('Greater Sarlacc\'s cost adjustment ability', function() {
            const defeatReadyResourcesPrompt = (count) => `Defeat up to ${count} ready resources`;
            const defeatResourcesChatLog = (count, discount) =>
                `player1 defeats ${count} ready resources to pay ${discount} resources less for Greater Sarlacc`;

            it('can be played by choosing not to defeat any resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: 12
                    }
                });

                const { context } = contextRef;

                // Playing Greater Sarlacc prompts to defeat resources, capped at the amount that would reduce the cost to 0
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toHavePrompt(defeatReadyResourcesPrompt(3));
                expect(context.player1).toHaveExactPromptButtons(['Choose nothing', 'Cancel']);

                // Choose not to defeat any resources, paying the full cost instead
                context.player1.clickPrompt('Choose nothing');

                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.player1.resources.length).toBe(12);
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.player2).toBeActivePlayer();
            });

            it('won\'t let you defeat more ready resources than needed to reduce its cost to 0', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: ['wampa', 'battlefield-marine', 'pyke-sentinel', 'atst', 'cartel-spacer', 'death-star-stormtrooper']
                    }
                });

                const { context } = contextRef;

                // All 6 ready resources are selectable, but only 3 are needed to fully pay for the card
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toHavePrompt(defeatReadyResourcesPrompt(3));
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa, context.battlefieldMarine, context.pykeSentinel, context.atst, context.cartelSpacer, context.deathStarStormtrooper
                ]);

                // Defeat 3 resources, reaching the cap; no more can be selected once the cost is fully paid
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.player1).not.toBeAbleToSelect(context.atst);
                context.player1.clickPrompt('Done');

                // Sarlacc is now in play
                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.getChatLogs(3)).toContain(defeatResourcesChatLog(3, 9));

                // All 3 chosen resources should now be in the discard pile
                expect(context.wampa).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('discard');

                // The remaining resources should still be ready
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('requires defeating enough resources to pay the remaining cost', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: ['wampa', 'battlefield-marine', 'pyke-sentinel', 'atst', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // With 5 ready resources, defeating none isn't enough to afford the card, so there's no "Choose nothing" option
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toHaveExactPromptButtons(['Done', 'Cancel']);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Must defeat at least 2 to reduce the cost to 3 and pay with the remaining 3
                context.player1.clickCard(context.wampa);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.getChatLogs(3)).toContain(defeatResourcesChatLog(2, 6));
            });

            it('cannot be played if defeating resources would not leave enough to pay the remaining cost', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: {
                            readyCount: 2,
                            exhaustedCount: 3,
                        }
                    }
                });

                const { context } = contextRef;

                // With only 2 ready resources, even defeating both still leaves remaining 3 cost unpayable
                expect(context.player1).not.toBeAbleToSelect(context.greaterSarlacc);
            });

            it('can be played by defeating all ready resources if that reduces the cost to 0', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: ['wampa', 'battlefield-marine', 'pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Defeat all 3 ready resources, reducing the cost to 0
                context.player1.clickCard(context.greaterSarlacc);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickPrompt('Done');

                // Card is played for free, no resources remain
                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.player1.resources.length).toBe(0);
                expect(context.wampa).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('discard');
            });

            it('can choose exhausted resources to defeat; they are rearranged to be ready first', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: [
                            { card: 'wampa', exhausted: true },
                            { card: 'battlefield-marine', exhausted: true },
                            'pyke-sentinel', 'atst', 'cartel-spacer', 'death-star-stormtrooper', 'alliance-xwing'
                        ]
                    }
                });

                const { context } = contextRef;

                // Every resource is selectable, ready or not, since resources can be freely rearranged (rule 1.7.4)
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa, context.battlefieldMarine, context.pykeSentinel, context.atst, context.cartelSpacer, context.deathStarStormtrooper, context.allianceXwing
                ]);

                // Defeat 2 resources, including the exhausted Wampa, then pay the remaining 3 with the rest
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickPrompt('Done');

                // The exhausted Wampa is rearranged to ready before being defeated
                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.getChatLogs(3)).toContain(defeatResourcesChatLog(2, 6));
            });

            it('cannot select more resources to defeat than are currently ready', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        credits: 3,
                        resources: [
                            'wampa',
                            { card: 'battlefield-marine', exhausted: true },
                            'pyke-sentinel',
                            { card: 'atst', exhausted: true }
                        ],
                    }
                });

                const { context } = contextRef;

                // With 2 ready resources, defeat both to reduce the cost to 3, then pay with Credit tokens
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toHavePrompt(defeatReadyResourcesPrompt(2));

                // The cap is reached after 2 selections, so the exhausted ATST can't be added even though it exists
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.player1).not.toBeAbleToSelect(context.atst);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHaveExactPromptButtons(['Use 3 Credits']);
                context.player1.clickPrompt('Use 3 Credits');

                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player1.resources.length).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.credits).toBe(0);
            });

            it('can be cancelled without defeating any resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        hand: ['greater-sarlacc'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Open the ability, then cancel out of it
                context.player1.clickCard(context.greaterSarlacc);
                context.player1.clickPrompt('Cancel');

                // Card remains in hand, nothing was defeated
                expect(context.greaterSarlacc).toBeInZone('hand');
                expect(context.player1.resources.length).toBe(5);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeActivePlayer();
            });

            it('uses the playing player\'s resources when played from the opponent\'s discard', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['obiwan-kenobi#finding-what-doesnt-exist'],
                        resources: ['wampa', 'battlefield-marine', 'pyke-sentinel', 'atst', 'cartel-spacer']
                    },
                    player2: {
                        deck: ['greater-sarlacc'],
                        resources: 20
                    }
                });

                const { context } = contextRef;

                // Obi-Wan discards Greater Sarlacc from the opponent's deck, and it can be played from their discard this phase ignoring aspect penalties
                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // 5 ready resources: must defeat at least 2 to reduce the cost to 3 and pay with the remaining 3
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toHavePrompt(defeatReadyResourcesPrompt(3));
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.pykeSentinel, context.atst, context.cartelSpacer]);

                // Defeat 2 resources, then pay the remaining 3 with player1's own resources
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                // The card is played under player1's control, paid entirely from player1's resources; player2's are untouched
                expect(context.greaterSarlacc).toBeInZone('groundArena', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.player2.resources.length).toBe(20);
                expect(context.player2.exhaustedResourceCount).toBe(0);
            });

            describe('when The Starhawk halves the cost', function() {
                it('cannot be played if the halved cost cannot be paid with the remaining resources', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['greater-sarlacc'],
                            spaceArena: ['the-starhawk#prototype-battleship'],
                            resources: 4
                        }
                    });

                    const { context } = contextRef;

                    // Costs 13 with aspect penalties: defeating 4 leaves 1 to pay (rounded up) with 0 resources
                    expect(context.player1).not.toBeAbleToSelect(context.greaterSarlacc);
                });

                it('computes the minimum number of resources to defeat after halving', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['greater-sarlacc'],
                            spaceArena: ['the-starhawk#prototype-battleship'],
                            resources: ['wampa', 'battlefield-marine', 'pyke-sentinel', 'atst', 'cartel-spacer']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.greaterSarlacc);
                    expect(context.player1).toHavePrompt(defeatReadyResourcesPrompt(5));

                    // Costs 13 with aspect penalties: defeating 3 reduces it to 4, halved to 2, paid with the remaining 2
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).not.toHaveEnabledPromptButton('Done');
                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickPrompt('Done');

                    // The remaining 2 resources pay the halved cost, leaving none ready
                    expect(context.greaterSarlacc).toBeInZone('groundArena');
                    expect(context.player1.resources.length).toBe(2);
                    expect(context.player1.readyResourceCount).toBe(0);
                });
            });

            it('cannot defeat itself when played from the resource zone', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen', // Avoids aspect penalties
                        groundArena: ['tech#source-of-insight'], // Grants Smuggle to friendly resources
                        resources: ['greater-sarlacc', 'wampa', 'battlefield-marine', 'pyke-sentinel', 'atst', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // Smuggle cost is 11 (printed cost + 2): with 6 ready resources, must defeat 3 others to reduce it to 2
                context.player1.clickCard(context.greaterSarlacc);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.pykeSentinel, context.atst, context.cartelSpacer]);

                // Greater Sarlacc itself is excluded from the selectable resources, since it can't defeat itself to pay for itself
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickPrompt('Done');

                expect(context.greaterSarlacc).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('discard');
            });
        });
    });
});
