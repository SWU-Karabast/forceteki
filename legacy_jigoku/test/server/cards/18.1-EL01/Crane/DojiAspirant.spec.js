describe('Doji Aspirant', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['shosuro-botanist', 'daidoji-uji'],
                    dynastyDiscard: ['doji-aspirant']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.aspirant = this.player1.findCardByName('doji-aspirant');
            this.botanist = this.player1.findCardByName('shosuro-botanist');
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.player1.placeCardInProvince(this.aspirant, 'province 1');
        });

        it('should react on entering play', function() {
            this.player1.clickCard(this.aspirant);
            this.player1.clickPrompt('1');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.aspirant);
            this.player1.clickCard(this.aspirant);
            expect(this.aspirant.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Dōji Aspirant to honor Dōji Aspirant');
        });
    });
});
