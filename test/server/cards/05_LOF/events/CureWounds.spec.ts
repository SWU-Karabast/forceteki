describe('Cure Wounds', function() {
    integration(function(contextRef) {
        describe('Cure Wounds\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['cure-wounds'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                        spaceArena: [{ card: 'relentless#konstantines-folly', damage: 7 }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }],
                    }
                });
            });

            it('uses the Force and heal 6 damage from a unit', function () {
                const { context } = contextRef;

                expect(context.relentless.damage).toBe(7);

                context.player1.clickCard(context.cureWounds);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1).toBeAbleToSelectExactly([context.relentless, context.battlefieldMarine, context.wampa]);

                context.player1.clickCard(context.relentless);
                expect(context.relentless.damage).toBe(1);
            });

            it('has no effect if the player does not have the force', function () {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.cureWounds);

                expect(context.relentless.damage).toBe(7);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
