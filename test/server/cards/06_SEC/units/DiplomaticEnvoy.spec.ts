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
                        hand: ['imperial-dark-trooper'],
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

                context.player2.clickCard(context.imperialDarkTrooper);
                expect(context.player1).toBeActivePlayer();

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

        describe('Diplomatic Envoy\'s ability with a unit owned by the opponent', function () {
            it('should give Ambush to an opponent-owned unit played from the opponent\'s discard pile', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown', 'diplomatic-envoy', 'battlefield-marine'],
                    },
                    player2: {
                        spaceArena: ['stolen-athauler', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // defeat the opponent's Stolen AT-Hauler, its When Defeated lets player1 play it from player2's discard pile
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.stolenAthauler);
                expect(context.stolenAthauler).toBeInZone('discard', context.player2);

                context.player2.passAction();

                context.player1.clickCard(context.diplomaticEnvoy);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.clickDone();

                context.player2.passAction();

                // play the Stolen AT-Hauler owned by player2, it gains Ambush
                context.player1.clickCard(context.stolenAthauler);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard', context.player2);
                expect(context.stolenAthauler.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
