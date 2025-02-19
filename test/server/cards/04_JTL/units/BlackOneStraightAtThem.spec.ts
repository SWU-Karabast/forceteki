describe('Black One, Straight At Them', function() {
    integration(function(contextRef) {
        describe('Black One\'s constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['top-target']
                    },
                    player2: {
                        spaceArena: ['black-one#straight-at-them']
                    }
                });
            });

            it('should not get +1/0 because the unit is not upgraded', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.blackOne);
                context.player2.clickCard(context.p1Base);

                expect(context.blackOne.getPower()).toBe(2);
                expect(context.p1Base.damage).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });

            it('should get +1/0 because the unit is upgraded', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.topTarget);
                context.player1.clickCard(context.blackOne);

                expect(context.blackOne).toHaveExactUpgradeNames(['top-target']);
                expect(context.blackOne.getPower()).toBe(3);

                context.player2.clickCard(context.blackOne);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Black One\'s on attack ability', function() {
            it('should allow 1 damage to a unit for controlling Poe Dameron as a leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['black-one#straight-at-them']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blackOne);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.blackOne, context.deathStarStormtrooper, context.infernoFour]);

                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow 1 damage to a unit for controlling Poe Dameron as a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['poe-dameron#quick-to-improvise'],
                        spaceArena: ['black-one#straight-at-them']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blackOne);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.blackOne, context.poeDameron, context.deathStarStormtrooper, context.infernoFour]);

                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});