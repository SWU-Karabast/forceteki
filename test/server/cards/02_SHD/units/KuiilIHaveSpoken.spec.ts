
describe('Kuiil, I Have Spoken', function () {
    integration(function (contextRef) {
        describe('Kuiil\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rey#more-than-a-scavenger',
                        base: 'tarkintown',
                        groundArena: ['kuiil#i-have-spoken'],
                        deck: ['green-squadron-awing', 'restored-arc170'],
                    }
                });
            });

            it('should discard a card and only draw it if it shares an aspect with the base', function () {
                const { context } = contextRef;

                // Should draw the discarded card since it shares an aspect with the base
                context.player1.clickCard(context.kuiil);
                context.player1.clickCard(context.player2.base);

                expect(context.player1).toHaveExactPromptButtons(['Discard a card from your deck.', 'Restore 1']);

                context.player1.clickPrompt('Discard a card from your deck.');
                expect(context.greenSquadronAwing).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // Should not draw the discarded card since it does not share an aspect with the base
                context.player1.setDeck([context.restoredArc170]);

                context.player1.clickCard(context.kuiil);
                context.player1.clickCard(context.player2.base);

                expect(context.player1).toHaveExactPromptButtons(['Discard a card from your deck.', 'Restore 1']);

                context.player1.clickPrompt('Discard a card from your deck.');
                expect(context.restoredArc170).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // Should do nothing since there are no cards in the deck
                context.player1.setDeck([]);

                context.player1.clickCard(context.kuiil);
                context.player1.clickCard(context.player2.base);

                expect(context.player1).toHaveExactPromptButtons(['Discard a card from your deck.', 'Restore 1']);

                context.player1.clickPrompt('Discard a card from your deck.');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

