
describe('Malevolence, Grievous\'s Secret Weapon', function () {
    integration(function (contextRef) {
        it('Malevolence\'s ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['malevolence#grievouss-secret-weapon']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.malevolence);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            // Wampa should have -4 power and can't attack
            expect(context.wampa.getPower()).toBe(0);
            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player2);

            context.moveToNextActionPhase();
            context.player1.passAction();

            // Wampa should have its power restored and be able to attack
            expect(context.wampa.getPower()).toBe(4);
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(4);
        });
    });
});
