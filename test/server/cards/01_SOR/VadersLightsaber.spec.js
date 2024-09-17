describe('Vader\'s Lightsaber', function() {
    integration(function() {
        describe('Vader\'s Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vaders-lightsaber'],
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should deal 4 damage to a ground unit when attached to Darth Vader unit', function () {
                this.player1.clickCard(this.vadersLightsaber);
                this.player1.clickCard(this.darthVader);

                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.darthVader]);
                expect(this.player1).not.toHavePassAbilityPrompt();

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(4);
            });
        });
    });
});
