
describe('Malevolence, Grievous\'s Secret Weapon', function () {
    integration(function (contextRef) {
        it('Malevolence\'s ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['malevolence#grievouss-secret-weapon']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.malevolence);
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            // ATST should have -4 power and can't attack
            expect(context.atst.getPower()).toBe(2);
            expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player2);
            expect(context.getChatLogs(1)).toContain('player1 uses Malevolence to give -4/-0 and to apply a "cannot attack" restriction to AT-ST for this phase');

            context.moveToNextActionPhase();
            context.player1.passAction();

            // ATST should have its power restored and be able to attack
            expect(context.atst.getPower()).toBe(6);
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(6);
        });
    });
});
