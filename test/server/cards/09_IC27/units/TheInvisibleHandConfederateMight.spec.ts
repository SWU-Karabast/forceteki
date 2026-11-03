describe('The Invisible Hand, Confederate Might', function () {
    integration(function (contextRef) {
        describe('The Invisible Hand\'s When Played ability', function () {
            it('should make the next card played this phase cost 9 resources less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'krayt-dragon', 'wampa'],
                        resources: 14
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                expect(context.theInvisibleHandConfederateMight).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.player2.passAction();

                // Krayt Dragon: 9 -> 0
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.player2.passAction();

                // the discount is used up: Wampa costs full 4
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(14);
            });

            it('should be used up entirely by a next card that costs less than 9', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'death-star-stormtrooper', 'wampa'],
                        resources: 14
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // Death Star Stormtrooper: 1 -> 0
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.player2.passAction();

                // the remaining discount is lost: Wampa costs full 4
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(14);
            });

            it('should apply to an event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'blood-sport'],
                        resources: 10
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // Blood Sport: 3 -> 0
                context.player1.clickCard(context.bloodSport);
                expect(context.bloodSport).toBeInZone('discard', context.player1);
                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should apply to an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'battle-fury'],
                        groundArena: ['atst'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // Battle Fury: 2 -> 0
                context.player1.clickCard(context.battleFury);
                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['battle-fury']);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should apply to and be used up by a card played with Piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'independent-smuggler', 'wampa'],
                        spaceArena: ['cartel-spacer'],
                        resources: 14
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // Independent Smuggler with Piloting: 1 -> 0
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                expect(context.theInvisibleHandConfederateMight).toHaveExactUpgradeNames(['independent-smuggler']);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.player2.passAction();

                // the discount is used up: Wampa costs full 4
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(14);
            });

            it('should apply to a card played with Smuggle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might'],
                        resources: [
                            'reckless-gunslinger',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst'
                        ]
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // Reckless Gunslinger with Smuggle: 3 -> 0
                context.player1.clickCard(context.recklessGunslinger);
                expect(context.recklessGunslinger).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should not be used up by deploying a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'krayt-dragon'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // Player 1 deploys Boba Fett
                context.player1.clickCard(context.p1Leader);
                context.player1.clickPrompt('Deploy Boba Fett');
                expect(context.p1Leader).toBeInZone('groundArena', context.player1);

                context.player2.passAction();

                // Krayt Dragon: 9 -> 0
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should not apply to the opponent\'s cards and should not be used up by them', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'krayt-dragon'],
                        resources: 10
                    },
                    player2: {
                        hand: ['alliance-xwing'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);

                // Player 2 plays Alliance X-Wing, which costs the full 2
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(2);

                // Krayt Dragon: 9 -> 0
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should expire at the end of the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'wampa'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                // Move to the next action phase
                context.moveToNextActionPhase();

                // Wampa costs full 4 in the next phase
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });

        describe('The Invisible Hand\'s When Defeated ability', function () {
            it('should make the next card played this phase cost 9 resources less after The Invisible Hand has left play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['krayt-dragon', 'wampa'],
                        spaceArena: ['the-invisible-hand#confederate-might'],
                        resources: 4
                    },
                    player2: {
                        hand: ['vanquish'],
                        spaceArena: ['alliance-xwing'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats The Invisible Hand with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.theInvisibleHandConfederateMight);
                expect(context.theInvisibleHandConfederateMight).toBeInZone('discard', context.player1);

                // Krayt Dragon: 9 -> 0
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // the discount is used up: Wampa costs full 4
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should give a new discount after the When Played discount was used up in the same phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'death-star-stormtrooper', 'krayt-dragon'],
                        resources: 10
                    },
                    player2: {
                        hand: ['vanquish'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);
                context.player2.passAction();

                // When Played discount: Death Star Stormtrooper 1 -> 0
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                // Player 2 defeats The Invisible Hand with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.theInvisibleHandConfederateMight);
                expect(context.theInvisibleHandConfederateMight).toBeInZone('discard', context.player1);

                // When Defeated discount: Krayt Dragon 9 -> 0
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });

            it('should stack with an unused When Played discount on the same next card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'kestro-city',
                        hand: ['the-invisible-hand#confederate-might', 'executor#might-of-the-empire', 'wampa'],
                        resources: 14
                    },
                    player2: {
                        hand: ['vanquish'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays The Invisible Hand
                context.player1.clickCard(context.theInvisibleHandConfederateMight);

                // Player 2 defeats The Invisible Hand with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.theInvisibleHandConfederateMight);
                expect(context.theInvisibleHandConfederateMight).toBeInZone('discard', context.player1);

                // Executor: 11 + 2 aspect penalty = 13, minus 18 -> 0
                context.player1.clickCard(context.executor);
                expect(context.executor).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.player2.passAction();

                // both discounts are used up: Wampa costs full 4
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(14);
            });
        });
    });
});
