describe('No Bargain', function() {
    integration(function(contextRef) {
        describe('No Bargain\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['no-bargain', 'wampa'],
                    },
                    player2: {
                        hand: ['pillage', 'crafty-smuggler'],
                    }
                });
            });

            it('should draw a card and make opponent discard one', function () {
                const { context } = contextRef;

                const activePlayerStartingHandSize = context.player1.handSize;
                const opponentStartingHandSize = context.player2.handSize;

                context.player1.clickCard(context.noBargain);

                expect(context.player2).toBeAbleToSelectExactly([context.pillage, context.craftySmuggler]);
                context.player2.clickCard(context.pillage);
                expect(context.pillage).toBeInLocation('discard');

                expect(context.player2.handSize).toBe(opponentStartingHandSize - 1);
                expect(context.player1.handSize).toBe(activePlayerStartingHandSize);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('No Bargain\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['no-bargain', 'wampa'],
                    },
                    player2: {
                        hand: [],
                    }
                });
            });

            it('should draw a card and skip discard if opponent has no cards in hand', function () {
                const { context } = contextRef;

                const activePlayerStartingHandSize = context.player1.handSize;
                const opponentStartingHandSize = context.player2.handSize;

                context.player1.clickCard(context.noBargain);

                expect(context.player2.handSize).toBe(opponentStartingHandSize);
                expect(context.player2.discard.length).toBe(0);
                expect(context.player1.handSize).toBe(activePlayerStartingHandSize);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
