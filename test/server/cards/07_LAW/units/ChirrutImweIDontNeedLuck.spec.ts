describe('Chirrut Imwe, I Don\'t Need Luck', function() {
    integration(function(contextRef) {
        describe('Chirrut Imwe\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'chirrut-imwe#i-dont-need-luck', damage: 2 }, { card: 'atst', damage: 5 }],
                    },
                    player2: {
                        groundArena: ['atat-suppressor'],
                    }
                });
            });

            it('should heal 4 damage from another unit if he dealt combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.atatSuppressor]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
            });
        });
    });
});
