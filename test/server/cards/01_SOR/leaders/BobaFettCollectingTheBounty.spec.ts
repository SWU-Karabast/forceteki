describe('Boba Fett, Collecting the Bounty', function() {
    integration(function(contextRef) {
        describe('Boba Fett\'s leader ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall', 'waylay'],
                        groundArena: ['death-star-stormtrooper'],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'dagobah-swamp',
                        resources: 6,
                    },
                    player2: {
                        groundArena: ['viper-probe-droid', 'cell-block-guard', 'wampa'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should ready a resource when an enemy unit leaves play', function() {
                const { context } = contextRef;

                const reset = () => {
                    context.player2.passAction();
                    context.player1.setResourceCount(6);
                    context.bobaFett.exhausted = false;
                };

                // Case 1 - when defeating an enemy unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.viperProbeDroid);

                expect(context.player1.readyResourceCount).toBe(1);
                expect(context.bobaFett.exhausted).toBeTrue();

                // Case 2 - when returning an enemy unit to hand
                reset();

                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.wampa);

                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.bobaFett.exhausted).toBeTrue();

                // Case 3 - when defeating an enemy leader unit
                reset();
                context.player1.moveCard(context.rivalsFall, 'hand');

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.player1.readyResourceCount).toBe(1);
                expect(context.bobaFett.exhausted).toBeTrue();

                // Case 4 - when there are no exhausted resources
                reset();

                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.bobaFett.exhausted).toBeFalse();

                // Case 5 - when a friendly unit leaves play
                reset();
                context.player1.moveCard(context.rivalsFall, 'hand');
                context.player1.moveCard(context.deathStarStormtrooper, 'groundArena');

                context.player1.clickCard(context.rivalsFall);

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.bobaFett.exhausted).toBeFalse();
            });
        });

        describe('Boba Fett\'s leader unit ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true },
                        base: 'spice-mines',
                        resources: 5,
                    },
                    player2: {
                        groundArena: ['cell-block-guard'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should ready 2 resources when Boba Fett completes an attack if an enemy unit left play this turn', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);

                expect(context.player1.readyResourceCount).toBe(3);
            });

            it('should not ready resources if Boba Fett dies while attacking, even if an enemy unit left play this turn', function() {
                const { context } = contextRef;

                context.setDamage(context.bobaFett, 4);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);

                expect(context.player1.readyResourceCount).toBe(1);
            });
        });
    });
});
