describe('Uniqueness rule', function() {
    integration(function(contextRef) {
        describe('When another copy of a unique card in play enters play', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['chopper#metal-menace'],
                        groundArena: ['chopper#metal-menace'],
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;
                const choppers = context.player1.findCardsByName('chopper#metal-menace');
                context.chopperInHand = choppers.find((chopper) => chopper.location === 'hand');
                context.chopperInPlay = choppers.find((chopper) => chopper.location === 'ground arena');
            });

            it('the copy already in play should be defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chopperInHand);
                expect(context.chopperInHand).toBeInLocation('ground arena');
                expect(context.chopperInPlay).toBeInLocation('discard');
            });
        });
    });
});
