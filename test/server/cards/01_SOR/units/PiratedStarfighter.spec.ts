describe('Pirated Starfighter', function () {
    integration(function (contextRef) {
        describe('Pirated Starfighter\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pirated-starfighter'],
                    }
                });
            });

            it('should not prompt player if no units are available to return to hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.piratedStarfighter);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Pirated Starfighter\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['pirated-starfighter'],
                        groundArena: ['pyke-sentinel'],
                    }
                });
            });

            it('should be able to return self or other unit to hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.piratedStarfighter);
                expect(context.player1).toBeAbleToSelectExactly([context.piratedStarfighter, context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInLocation('hand', context.player1);
                expect(context.piratedStarfighter).toBeInLocation('space arena', context.player1);
            });
        });
    });
});
