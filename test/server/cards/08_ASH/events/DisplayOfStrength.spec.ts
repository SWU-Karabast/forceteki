describe('Display of Strength', function() {
    integration(function(contextRef) {
        it('Display of Strength\'s ability should give +3/+3 to a unit for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['display-of-strength'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['mynock']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.displayOfStrength);

            expect(context.player1).toBeAbleToSelectExactly([context.mynock, context.awing, context.atst, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.getPower()).toBe(6);
            expect(context.battlefieldMarine.getHp()).toBe(6);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.battlefieldMarine.getPower()).toBe(6);
            expect(context.battlefieldMarine.getHp()).toBe(6);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});