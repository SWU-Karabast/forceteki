describe('Eminent Keyword', function() {
    integration(function() {
        describe('Testing Eminent', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        provinces: ['city-of-the-rich-frog'],
                        inPlay: ['kitsu-warrior'],
                        dynastyDiscard: ['bayushi-liar', 'bayushi-shoju', 'doomed-shugenja', 'akodo-zentaro']
                    },
                    player2: {
                        dynastyDiscard: ['kitsuki-yaruma']
                    }
                });

                this.richFrog = this.player1.findCardByName('city-of-the-rich-frog', 'province 1');
                this.shamefulDisplay = this.player1.findCardByName('shameful-display', 'province 2');
                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.akodoZentaro = this.player1.findCardByName('akodo-zentaro');
                this.kitsuWarrior = this.player1.findCardByName('kitsu-warrior');
                this.bayushiLiar = this.player1.placeCardInProvince('bayushi-liar', 'province 1');
                this.bayushiShoju = this.player1.placeCardInProvince('bayushi-shoju', 'province 2');

                this.kitsukiYaruma = this.player2.placeCardInProvince('kitsuki-yaruma', 'province 1');
            });

            it('should start the game faceup', function() {
                expect(this.richFrog.facedown).toBe(false);
            });

            it('should not be able to be turned facedown', function() {
                this.shamefulDisplay.facedown = false;
                this.player1.pass();
                this.player2.clickCard(this.kitsukiYaruma);
                this.player2.clickPrompt('0');
                expect(this.kitsukiYaruma.location).toBe('play area');
                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.kitsukiYaruma);
                expect(this.player2).toHavePrompt('Choose a province');
                expect(this.player2).toBeAbleToSelect(this.shamefulDisplay);
                expect(this.player2).not.toBeAbleToSelect(this.richFrog);
            });
        });

        describe('testing eminent - during setup', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'setup',
                    player1: {
                        provinces: ['city-of-the-rich-frog']
                    },
                    skipAutoSetup: true
                });
                this.richFrog = this.player1.findCardByName('city-of-the-rich-frog');

                this.selectFirstPlayer(this.player1);
            });

            it('cannot be stronghold province', function() {
                expect(this.player1).toHavePrompt('Select stronghold province');
                this.player1.clickCard(this.richFrog);
                expect(this.player1).toHavePrompt('Select stronghold province');
            });
        });
    });
});
