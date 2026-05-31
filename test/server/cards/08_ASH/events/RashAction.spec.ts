describe('Rash Action', function () {
    integration(function (contextRef) {
        describe('Rash Action\'s event ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rash-action'],
                        groundArena: ['porg']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should allow attacking with a unit that gets +1/+0 for the attack', function () {
                const { context } = contextRef;

                // play Rash Action
                context.player1.clickCard(context.rashAction);
                // select unit to attack
                context.player1.clickCard(context.porg);
                // select target
                context.player1.clickCard(context.wampa);

                // TODO: Verify the unit gets +1/+0 for this attack
            });

            it('should cause opponent to discard a card if the attacking unit deals combat damage to their base', function () {
                const { context } = contextRef;

                // TODO: Set up scenario where unit attacks base and deals damage
                // TODO: Verify opponent discards a card
            });

            it('should not cause opponent to discard if no combat damage dealt to base', function () {
                const { context } = contextRef;

                // TODO: Attack a unit instead of base
                // TODO: Verify no discard occurs
            });
        });
    });
});
