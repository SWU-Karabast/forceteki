describe('Trick of the Light', function () {
    integration(function () {
        describe('Trick of the Light\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-juro'],
                        hand: ['trick-of-the-light']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves']
                    }
                });
                this.moto = this.player1.findCardByName('moto-juro');
                this.trickOfLight = this.player1.findCardByName('trick-of-the-light');

                this.adept = this.player2.findCardByName('adept-of-the-waves');
            });

            it('should not work outside of conflicts', function () {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.trickOfLight);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should blank the characters text box', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.moto],
                    defenders: [this.adept]
                });
                this.player2.pass();
                this.player1.clickCard(this.trickOfLight);
                expect(this.player1).toHavePrompt('Trick Of The Light');
                expect(this.player1).toBeAbleToSelect(this.adept);
                this.player1.clickCard(this.adept);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.adept);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should not be able to target character at home', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.moto],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.trickOfLight);
                expect(this.player1).toHavePrompt('Trick Of The Light');
                expect(this.player1).not.toBeAbleToSelect(this.adept);
            });
        });
    });
});
