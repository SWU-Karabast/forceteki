describe('Akodo Reserve Company', function() {
    integration(function() {
        describe('Akodo Reserve Company\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['akodo-reserve-company', 'shinjo-shono'],
                        hand: ['total-warfare']
                    },
                    player2: {
                        inPlay: ['venerable-historian', 'solemn-scholar'],
                        provinces: ['fertile-fields'],
                        hand: ['let-go', 'grasp-of-earth']
                    }
                });

                this.company = this.player1.findCardByName('akodo-reserve-company');
                this.shono = this.player1.findCardByName('shinjo-shono');
                this.fields = this.player2.findCardByName('fertile-fields');
                this.totalWarfare = this.player1.findCardByName('total-warfare');
                this.player1.playAttachment(this.totalWarfare, this.fields);

                this.historian = this.player2.findCardByName('venerable-historian');
                this.scholar = this.player2.findCardByName('solemn-scholar');
                this.graspOfEarth = this.player2.findCardByName('grasp-of-earth');

                this.player2.playAttachment(this.graspOfEarth, this.scholar);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.shono],
                    defenders: [this.historian]
                });
            });

            it('should not work if a battlefield is not in play', function() {
                this.player2.clickCard('let-go');
                this.player2.clickCard(this.totalWarfare);
                expect(this.totalWarfare.location).toBe('conflict discard pile');
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.company);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should work if a battlefield is in play during a conflict', function() {
                this.player2.pass();
                this.player1.clickCard(this.company);
                expect(this.player1).toHavePrompt('Akodo Reserve Company');
                expect(this.player1).toBeAbleToSelect(this.shono);
                expect(this.player1).not.toBeAbleToSelect(this.historian);
            });

            it('should send the other character home and move in the company', function() {
                this.player2.pass();
                this.player1.clickCard(this.company);
                this.player1.clickCard(this.shono);
                expect(this.shono.isParticipating()).toBe(false);
                expect(this.company.isParticipating()).toBe(true);
            });

            it('should not move the chosen character home if Akodo Reserve company can\'t move in', function() {
                this.player2.clickCard(this.graspOfEarth);

                this.player1.clickCard(this.company);
                this.player1.clickCard(this.shono);
                expect(this.shono.isParticipating()).toBe(true);
                expect(this.company.isParticipating()).toBe(false);
                expect(this.player1).toHavePrompt('conflict action window');
            });
        });
    });
});
