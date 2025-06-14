describe('Clone', function() {
    integration(function(contextRef) {
        describe('when played from hand', function() {
            it('should enter play as non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest]);

                context.player1.clickCard(context.enfysNest);
                expect(context.player1).toHavePrompt('Return an enemy non-leader unit with less power than this unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand');

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);
            });
        });
    });
});
