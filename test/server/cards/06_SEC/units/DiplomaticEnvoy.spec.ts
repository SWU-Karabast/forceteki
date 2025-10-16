describe('Diplomatic Envoy', function () {
    integration(function (contextRef) {
        describe('Diplomatic Envoy\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['diplomatic-envoy', 'battlefield-marine', 'wampa'],
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'atst']
                    }
                });
            });

            it('should dislose Command to give Ambush for this phase to the next unit we played this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticEnvoy);

                expect(context.player1).toHavePrompt('Disclose Command to give Ambush for this phase for the next unit you play this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.specforceSoldier);

                context.player2.passAction();

                // no more Ambush
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });

            it('should dislose Command to give Ambush for this phase to the next unit we played this phase (does nothing next action phase)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.diplomaticEnvoy);

                expect(context.player1).toHavePrompt('Disclose Command to give Ambush for this phase for the next unit you play this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
