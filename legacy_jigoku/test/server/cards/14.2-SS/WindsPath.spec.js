describe('Winds Path', function() {
    integration(function() {
        describe('Winds Path\'s constant ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['agasha-swordsmith'],
                        hand: ['grasp-of-earth']
                    },
                    player2: {
                        inPlay: ['akodo-gunso'],
                        provinces: ['wind-s-path'],
                        dynastyDiscard: ['kitsu-warrior', 'akodo-zentaro', 'doomed-shugenja', 'agasha-taiko']
                    }
                });
                this.agashaSwordsmith = this.player1.findCardByName('agasha-swordsmith');
                this.graspOfEarth = this.player1.findCardByName('grasp-of-earth');
                this.akodoGunso = this.player2.findCardByName('akodo-gunso');
                this.kitsuWarrior = this.player2.findCardByName('kitsu-warrior', 'dynasty discard pile');
                this.akodoZentaro = this.player2.findCardByName('akodo-zentaro', 'dynasty discard pile');
                this.doomedShugenja = this.player2.findCardByName('doomed-shugenja', 'dynasty discard pile');
                this.agashaTaiko = this.player2.findCardByName('agasha-taiko', 'dynasty discard pile');
                this.windsPath = this.player2.findCardByName('wind-s-path', 'province 1');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 2');


                this.player2.placeCardInProvince(this.kitsuWarrior, 'province 1');
                this.player2.placeCardInProvince(this.doomedShugenja, 'province 2');
                this.player2.moveCard(this.agashaTaiko, 'province 1');
            });

            it('should allow you to play characters in the province', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.agashaSwordsmith],
                    defenders: [],
                    province: this.windsPath
                });
                this.player2.clickCard(this.kitsuWarrior);
                expect(this.player2).toHavePrompt('Choose additional fate');
                this.player2.clickPrompt('Cancel');
                this.player2.clickCard(this.agashaTaiko);
                expect(this.player2).toHavePrompt('Choose additional fate');
                this.player2.clickPrompt('Cancel');
                this.player2.clickCard(this.doomedShugenja);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should work during any conflict', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.agashaSwordsmith],
                    defenders: [],
                    province: this.shamefulDisplay
                });
                this.player2.clickCard(this.kitsuWarrior);
                expect(this.player2).toHavePrompt('Choose additional fate');
                this.player2.clickPrompt('Cancel');
                this.player2.clickCard(this.agashaTaiko);
                expect(this.player2).toHavePrompt('Choose additional fate');
                this.player2.clickPrompt('Cancel');
                this.player2.clickCard(this.doomedShugenja);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should work during any conflict', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.akodoGunso],
                    defenders: []
                });
                this.player1.pass();
                this.player2.clickCard(this.kitsuWarrior);
                expect(this.player2).toHavePrompt('Choose additional fate');
                this.player2.clickPrompt('Cancel');
                this.player2.clickCard(this.agashaTaiko);
                expect(this.player2).toHavePrompt('Choose additional fate');
                this.player2.clickPrompt('Cancel');
                this.player2.clickCard(this.doomedShugenja);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should only allow you to play characters into the conflict', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.agashaSwordsmith],
                    defenders: [],
                    province: this.windsPath
                });
                this.player2.clickCard(this.kitsuWarrior);
                this.player2.clickPrompt('1');
                expect(this.player2).not.toHavePrompt('"Where do you wish to play this character?');
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.kitsuWarrior.location).toBe('play area');
                expect(this.kitsuWarrior.isParticipating()).toBe(true);
                expect(this.kitsuWarrior.fate).toBe(1);
            });

            it('should not allow characters to be played if grasp of earth has been activated', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.agashaSwordsmith],
                    defenders: [],
                    province: this.windsPath
                });
                this.player2.pass();
                this.player1.clickCard(this.graspOfEarth);
                this.player1.clickCard(this.agashaSwordsmith);
                this.player2.pass();
                this.player1.clickCard(this.graspOfEarth);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.kitsuWarrior);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
