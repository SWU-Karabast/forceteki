describe('Karis, We Don\'t Like Strangers', function() {
    integration(function(contextRef) {
        describe('Karis, We Don\'t Like Strangers\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['karis#we-dont-like-strangers'],
                        hasForceToken: true,
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown'],
                        groundArena: ['wampa']
                    }
                });
            });

            it('should allow using the force to give a unit -2/-2 for the phase when played', function() {
                const { context } = contextRef;
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.karis);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);
            });

            it('should not allow using the force if player has not', function() {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.karis);

                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Karis, We Don\'t Like Strangers\' ability and No Glory, Only Results', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['karis#we-dont-like-strangers', 'wampa'],
                        hasForceToken: true,
                    },
                    player2: {
                        hasInitiative: true,
                        hasForceToken: true,
                        hand: ['no-glory-only-results'],
                    }
                });
            });

            it('should allow using the force to give a unit -2/-2 for the phase when played', function() {
                const { context } = contextRef;
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.karis);

                expect(context.player2).toHavePassAbilityPrompt('Use the Force');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);
            });
        });
    });
});
