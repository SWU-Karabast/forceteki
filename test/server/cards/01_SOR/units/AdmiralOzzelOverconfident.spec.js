describe('Admiral Ozzel, Overconfident', function() {
    integration(function() {
        describe('Admiral Ozzel, Overconfident\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['atst', 'death-star-stormtrooper', 'maximum-firepower', 'liberated-slaves'],
                        groundArena: ['admiral-ozzel#overconfident'],
                        leader: 'grand-moff-tarkin#oversector-governor' // Making sure player1 has villainy aspect to be sure of cost later
                    },
                    player2: {
                        groundArena: [{card: 'wampa', exhausted: true}],
                        spaceArena: ['ruthless-raider']
                    }
                });
            });

            it('should allow the controller to play an imperial unit from hand, which enters play ready, and allow each opponent to ready a unit', function () {
                this.player1.clickCard(this.admiralOzzel);
                expect(this.player1).toHaveEnabledPromptButtons(['Play an Imperial unit from your hand. It enters play ready', 'Attack']);
                
                this.player1.clickPrompt('Play an Imperial unit from your hand. It enters play ready');
                expect(this.admiralOzzel.exhausted).toBe(true);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.deathStarStormtrooper]);
                expect(this.player1).toHaveEnabledPromptButton('Done');

                this.player1.clickCard(this.atst);
                expect(this.atst).toBeInLocation('ground arena');
                expect(this.atst.exhausted).toBe(false);
                expect(this.player1.countExhaustedResources()).toBe(6);

                expect(this.player2).toHavePrompt('Ready a unit');
                expect(this.player2).toHaveEnabledPromptButton('Done');
                expect(this.player2).toBeAbleToSelectExactly([this.atst, this.admiralOzzel, this.wampa, this.ruthlessRaider]);

                this.player2.clickCard(this.wampa);
                expect(this.wampa.exhausted).toBe(false);
            });
        });

        describe('Admiral Ozzel, Overconfident\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower', 'liberated-slaves'],
                        groundArena: ['admiral-ozzel#overconfident']
                    },
                    player2: {
                        groundArena: [{card: 'wampa', exhausted: true}],
                        spaceArena: ['ruthless-raider']
                    }
                });
            });

            it('should be activatable even if the controller can\'t play an imperial unit, and still allow each opponent to ready a unit', function () {
                this.player1.clickCard(this.admiralOzzel);
                expect(this.player1).toHaveEnabledPromptButtons(['Play an Imperial unit from your hand. It enters play ready', 'Attack']);
                
                this.player1.clickPrompt('Play an Imperial unit from your hand. It enters play ready');
                expect(this.admiralOzzel.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(0);

                expect(this.player2).toHavePrompt('Ready a unit');
                expect(this.player2).toBeAbleToSelectExactly([this.admiralOzzel, this.wampa, this.ruthlessRaider]);

                this.player2.clickCard(this.admiralOzzel);
                expect(this.admiralOzzel.exhausted).toBe(false);
            });
        });
    });
});