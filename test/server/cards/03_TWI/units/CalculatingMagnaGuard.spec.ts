describe('Calculating MagnaGuard', function () {
    integration(function (contextRef) {
        it('Calculating MagnaGuard\'s ability should gain sentinel when played or when a friendly unit is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['calculating-magnaguard'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            // play calculating magna guard, he should have sentinel
            context.player1.clickCard(context.calculatingMagnaguard);

            // opponent attack with battlefield marine, it should choose automatically calculating magna guard
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.calculatingMagnaguard]);
            context.player2.clickCard(context.calculatingMagnaguard);
            expect(context.player1).toBeActivePlayer();
            expect(context.calculatingMagnaguard.damage).toBe(3);

            context.setDamage(context.calculatingMagnaguard, 0);
            context.moveToNextActionPhase();

            context.player1.passAction();

            // calculating magnaguard is not anymore sentinel, opponent can attack base
            context.player2.clickCard(context.atst);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa, context.calculatingMagnaguard]);
            context.player2.clickCard(context.p1Base);

            // wampa attack atst and die, calculating magna guard should have sentinel
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.atst);

            // opponent attack with consular security force, his only choice is calculating magna guard
            context.player2.clickCard(context.consularSecurityForce);
            expect(context.player2).toBeAbleToSelectExactly([context.calculatingMagnaguard]);
            context.player2.clickCard(context.calculatingMagnaguard);
            expect(context.player1).toBeActivePlayer();
            expect(context.calculatingMagnaguard.damage).toBe(3);
        });
    });
});
