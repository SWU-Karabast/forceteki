describe('The Way of the Mand\'alor', function() {
    integration(function(contextRef) {
        beforeEach(function() {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-way-of-the-mandalor'],
                    groundArena: ['battlefield-marine', 'koska-reeves#loyal-nite-owl'],
                },
            });
        });
        it('The Way of the Mand\'alor\'s ability should not cost 1 resource less when played on non-Mandalorian unit', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.theWayOfTheMandalor);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('The Way of the Mand\'alor\'s ability should cost 1 resource less when played on Mandalorian unit', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.theWayOfTheMandalor);
            context.player1.clickCard(context.koskaReeves);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});