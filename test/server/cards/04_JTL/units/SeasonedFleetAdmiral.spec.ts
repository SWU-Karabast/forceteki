describe('Seasoned Fleet Admiral', function () {
    integration(function (contextRef) {
        describe('Seasoned Fleet Admiral\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-bargain'],
                        groundArena: ['seasoned-fleet-admiral', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['strategic-analysis'],
                        groundArena: ['wampa']
                    }
                });
            });

            it('should not give experience if we draw cards during action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noBargain);
                // no bargain ask opponent to discard a card
                context.player2.clickCard(context.strategicAnalysis);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give experience token to a unit if opponent draw cards during action phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.strategicAnalysis);

                expect(context.player1).toBeAbleToSelectExactly([context.seasonedFleetAdmiral, context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('should not give experience token if opponent draw cards during regroup phase', function () {
                const { context } = contextRef;

                context.moveToRegroupPhase();
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toHavePrompt('Choose an action');
            });
        });
    });
});
