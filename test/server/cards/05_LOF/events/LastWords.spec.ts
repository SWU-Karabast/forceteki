describe('Last Words', function() {
    integration(function(contextRef) {
        describe('Last Words\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['last-words'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'atst'],
                    }
                });
            });

            it('should give 2 experience tokens to a unit if a friendly unit was defeated this phase', function () {
                const { context } = contextRef;

                // Player 2 plays Vanquish to defeat a unit
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.greenSquadronAwing);

                // Player 1 plays Last Words
                context.player1.clickCard(context.lastWords);

                // Player 1 should be able to select a unit to give experience tokens
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give 2 experience tokens to a unit, as no friendly unit has been defeated this phase', function () {
                const { context } = contextRef;

                // Player 2 plays Vanquish to defeat a unit
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.atst);

                // Player 1 plays Last Words
                context.player1.clickCard(context.lastWords);
                context.player1.clickPrompt('Play anyway');

                // Nothing should happen as no friendly unit was defeated
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});