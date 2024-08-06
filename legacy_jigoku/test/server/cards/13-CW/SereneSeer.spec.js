describe('Serene Seer', function() {
    integration(function() {
        describe('Serene Seer\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['serene-seer'],
                        provinces: ['shameful-display']
                    },
                    player2: {
                        provinces: ['fertile-fields', 'manicured-garden']
                    }
                });
                this.seer = this.player1.findCardByName('serene-seer');
                this.shamefulDisplay = this.player1.findCardByName('shameful-display', 'province 1');
                this.fields = this.player2.findCardByName('fertile-fields', 'province 1');
                this.garden = this.player2.findCardByName('manicured-garden', 'province 2');
                this.garden.facedown = false;
            });

            it('should not work if the opponent has not claimed void ring', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.seer);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should only target your opponents provinces', function() {
                this.player2.claimRing('void');
                this.player1.clickCard(this.seer);
                expect(this.player1).toHavePrompt('Serene Seer');
                expect(this.player1).toBeAbleToSelect(this.fields);
                expect(this.player1).not.toBeAbleToSelect(this.garden);
                expect(this.player1).not.toBeAbleToSelect(this.shamefulDisplay);
            });

            it('should log the province name and location in the chat', function() {
                this.player2.claimRing('void');
                this.player1.clickCard(this.seer);
                this.player1.clickCard(this.fields);
                expect(this.getChatLogs(1)).toContain('Serene Seer sees Fertile Fields in province 1');
            });
        });
    });
});
