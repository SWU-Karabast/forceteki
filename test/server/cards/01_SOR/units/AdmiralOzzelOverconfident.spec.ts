describe('Admiral Ozzel, Overconfident', function() {
    integration(function(contextRef) {
        describe('Admiral Ozzel, Overconfident\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['atst', 'death-star-stormtrooper', 'maximum-firepower', 'liberated-slaves'],
                        groundArena: ['admiral-ozzel#overconfident'],
                        leader: 'grand-moff-tarkin#oversector-governor' // Making sure player1 has villainy aspect to be sure of cost later
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }],
                        spaceArena: ['ruthless-raider']
                    }
                });
            });

            it('should allow the controller to play an imperial unit from hand, which enters play ready, and allow each opponent to ready a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralOzzel);
                expect(context.player1).toHaveEnabledPromptButtons(['Play an Imperial unit from your hand. It enters play ready', 'Attack']);

                context.player1.clickPrompt('Play an Imperial unit from your hand. It enters play ready');
                expect(context.admiralOzzel.exhausted).toBe(true);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.deathStarStormtrooper]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('groundArena');
                expect(context.atst.exhausted).toBe(false);
                expect(context.player1.exhaustedResourceCount).toBe(6);

                expect(context.player2).toHavePrompt('Ready a unit');
                expect(context.player2).toHaveEnabledPromptButton('Done');
                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.admiralOzzel, context.wampa, context.ruthlessRaider]);

                context.player2.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBe(false);
            });
        });

        describe('Admiral Ozzel, Overconfident\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower', 'liberated-slaves'],
                        groundArena: ['admiral-ozzel#overconfident']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }],
                        spaceArena: ['ruthless-raider']
                    }
                });
            });

            it('should be activatable even if the controller can\'t play an imperial unit, and still allow each opponent to ready a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralOzzel);
                expect(context.player1).toHaveEnabledPromptButtons(['Play an Imperial unit from your hand. It enters play ready', 'Attack']);

                context.player1.clickPrompt('Play an Imperial unit from your hand. It enters play ready');
                expect(context.admiralOzzel.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                expect(context.player2).toHavePrompt('Ready a unit');
                expect(context.player2).toBeAbleToSelectExactly([context.admiralOzzel, context.wampa, context.ruthlessRaider]);

                context.player2.clickCard(context.admiralOzzel);
                expect(context.admiralOzzel.exhausted).toBe(false);
            });
        });
    });
});