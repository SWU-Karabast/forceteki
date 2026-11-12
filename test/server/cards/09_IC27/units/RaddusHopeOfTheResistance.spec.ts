describe('Raddus, Hope of the Resistance', function() {
    integration(function(contextRef) {
        describe('Raddus\'s constant ability', function() {
            it('should not increase the cost of cards the opponent plays while Raddus is ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['raddus#hope-of-the-resistance']
                    },
                    player2: {
                        hand: ['alliance-xwing'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Alliance X-Wing at its normal cost
                context.player2.clickCard(context.allianceXwing);

                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });

            it('should increase the cost of units, events and upgrades the opponent plays by 3 while Raddus is exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'raddus#hope-of-the-resistance', exhausted: true }]
                    },
                    player2: {
                        hand: ['alliance-xwing', 'moment-of-peace', 'resilient'],
                        groundArena: ['wampa'],
                        resources: 20,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 plays a unit: 2 + 3
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(5);

                context.player1.passAction();

                // Player 2 plays an event: 1 + 3
                context.player2.clickCard(context.momentOfPeace);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.player2.exhaustedResourceCount).toBe(9);

                context.player1.passAction();

                // Player 2 plays an upgrade: 1 + 3
                context.player2.clickCard(context.resilient);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield', 'resilient']);
                expect(context.player2.exhaustedResourceCount).toBe(13);
            });

            it('should not increase the cost of cards its controller plays', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['alliance-xwing'],
                        spaceArena: [{ card: 'raddus#hope-of-the-resistance', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Alliance X-Wing at its normal cost
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should prevent the opponent from playing a card they cannot afford with the increased cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'raddus#hope-of-the-resistance', exhausted: true }]
                    },
                    player2: {
                        hand: ['alliance-xwing'],
                        resources: 4,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Alliance X-Wing costs 5 with Raddus exhausted, but player 2 has only 4 resources
                expect(context.allianceXwing).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should not increase the resource cost of the opponent\'s action abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'raddus#hope-of-the-resistance', exhausted: true }]
                    },
                    player2: {
                        leader: 'grand-moff-tarkin#oversector-governor',
                        groundArena: ['death-star-stormtrooper'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 uses Tarkin's leader action
                context.player2.clickCard(context.grandMoffTarkin);
                context.player2.clickPrompt('Give an experience token to an Imperial unit');
                context.player2.clickCard(context.deathStarStormtrooper);

                // Only the ability's own cost of 1 resource is paid
                expect(context.deathStarStormtrooper).toHaveExactUpgradeNames(['experience']);
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });

            it('should start increasing costs after Raddus attacks and heal 3 damage from its controller\'s base with Restore', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['raddus#hope-of-the-resistance'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Player 1 attacks with Raddus
                context.player1.clickCard(context.raddus);
                context.player1.clickCard(context.p2Base);

                // Raddus is exhausted and Restore heals player 1's base
                expect(context.raddus.exhausted).toBeTrue();
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(8);

                // Player 2 plays Alliance X-Wing at the increased cost: 2 + 3
                context.player2.clickCard(context.allianceXwing);

                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(5);
            });

            it('should stop increasing costs once Raddus leaves play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'raddus#hope-of-the-resistance', exhausted: true }]
                    },
                    player2: {
                        hand: ['vanquish', 'alliance-xwing'],
                        resources: 20,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats Raddus with Vanquish: 5 + 3
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.raddus);

                expect(context.raddus).toBeInZone('discard', context.player1);
                expect(context.player2.exhaustedResourceCount).toBe(8);

                context.player1.passAction();

                // Player 2 plays Alliance X-Wing at its normal cost
                context.player2.clickCard(context.allianceXwing);

                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(10);
            });

            it('should stop increasing costs once Raddus is readied', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'raddus#hope-of-the-resistance', exhausted: true }]
                    },
                    player2: {
                        hand: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Raddus readies in the next action phase
                context.moveToNextActionPhase();

                expect(context.raddus.exhausted).toBeFalse();

                context.player1.passAction();

                // Player 2 plays Alliance X-Wing at its normal cost
                context.player2.clickCard(context.allianceXwing);

                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });
        });
    });
});
