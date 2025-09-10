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
                        hand: ['strategic-analysis', 'this-is-the-way'],
                        groundArena: ['wampa'],
                        deck: ['sabine-wren#explosives-artist', 'supercommando-squad']
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

            it('should only give 1 experience token if opponent draws multiple cards at once during action phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.thisIsTheWay);
                context.player2.clickCardInDisplayCardPrompt(context.sabineWren);
                context.player2.clickCardInDisplayCardPrompt(context.supercommandoSquad);
                context.player2.clickDone();

                expect(context.player1).toHavePrompt('Give an Experience token to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.seasonedFleetAdmiral, context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.seasonedFleetAdmiral);

                expect(context.player1).toBeActivePlayer();
                expect(context.seasonedFleetAdmiral).toHaveExactUpgradeNames(['experience']);
                expect(context.battlefieldMarine.upgrades.length).toBe(0);
                expect(context.wampa.upgrades.length).toBe(0);
            });

            it('should not give experience token if opponent draw cards during regroup phase', function () {
                const { context } = contextRef;

                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toHavePrompt('Choose an action');
            });
        });
    });
});
