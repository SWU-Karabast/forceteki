describe('Faith in the Empire', function() {
    integration(function(contextRef) {
        beforeEach(function() {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['faith-in-the-empire'],
                    groundArena: ['battlefield-marine', 'atst'],
                },
            });
        });
        it('Faith in the Empire\'s ability should not cost 1 resource less when played on non-Imperial unit', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.faithInTheEmpire);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Faith in the Empire\'s ability should cost 1 resource less when played on Imperial unit', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.faithInTheEmpire);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});