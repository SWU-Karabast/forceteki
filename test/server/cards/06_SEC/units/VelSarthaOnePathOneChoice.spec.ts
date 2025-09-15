describe('Vel Sartha, One Path, One Choice', function () {
    integration(function (contextRef) {
        describe('Vel Sartha\'s constant ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['vel-sartha#one-path-one-choice', 'wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should give -2 power to an exhausted enemy unit while it is defending', function () {
                const { context } = contextRef;

                // Exhaust Battlefield Marine by attacking with it
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
                expect(context.battlefieldMarine.exhausted).toBe(true);

                // Now attack the exhausted Marine with Wampa; while defending, Marine should get -2 power (3 -> 1)
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                // Marine takes 4 damage and is defeated; Wampa only takes 1 damage back (3 base - 2 from Vel)
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.wampa.damage).toBe(1);
            });

            it('should not give -2 power to non-exhausted enemy unit while they are defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.wampa.damage).toBe(3);
            });
        });
    });
});
