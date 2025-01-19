
describe('Kuiil, I Have Spoken', function () {
    integration(function (contextRef) {
        describe('Kuiil\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'rey#more-than-a-scavenger',
                        base: 'tarkintown',
                        groundArena: ['kuiil#i-have-spoken'],
                        deck: ['green-squadron-awing', 'restored-arc170'],
                    }
                });
            });

            it('should dicarded card that shares aspect with their base and draw the card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.kuiil);
                context.player1.clickCard(context.player2.base);

                expect(context.player1).toHaveEnabledPromptButtons(['Discard a card from your deck.', 'Restore 1']);

                context.player1.clickPrompt('Discard a card from your deck.');
                // Following prompt is to use Kuiil's Restore 1 ability
                context.player1.clickCard(context.player1.base);

                expect(context.greenSquadronAwing).toBeInZone('hand');
            });

            it('should dicarded card that does not share an aspect with their base and not draw the card', function () {
                const { context } = contextRef;

                context.player1.setDeck([context.restoredArc170, context.greenSquadronAwing]);
                context.player1.clickCard(context.kuiil);
                context.player1.clickCard(context.player2.base);

                expect(context.player1).toHaveEnabledPromptButtons(['Discard a card from your deck.', 'Restore 1']);

                context.player1.clickPrompt('Discard a card from your deck.');
                // Following prompt is to use Kuiil's Restore 1 ability
                context.player1.clickCard(context.player1.base);

                expect(context.restoredArc170).toBeInZone('discard');
            });
        });
    });
});
