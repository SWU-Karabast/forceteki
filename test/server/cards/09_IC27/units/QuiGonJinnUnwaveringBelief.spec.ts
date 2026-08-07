describe('Qui-Gon Jinn, Unwavering Belief', function() {
    integration(function(contextRef) {
        it('Qui-Gon Jinn\'s when played ability should give +2/+2 to another friendly unit for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['quigon-jinn#unwavering-belief'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quigonJinn);

            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.battlefieldMarine]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(5); // 3 + 2
            expect(context.battlefieldMarine.getHp()).toBe(5); // 3 + 2

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
