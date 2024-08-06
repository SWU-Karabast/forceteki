describe('The Way of Peace', function() {
    integration(function() {
        describe('The Way of Peace\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['attendant-to-the-emperor']
                    },
                    player2: {
                        inPlay: ['doji-hotaru', 'kakita-kaezin'],
                        provinces: ['the-way-of-peace']
                    }
                });
                this.attendant = this.player1.findCardByName('attendant-to-the-emperor');

                this.wayOfPeace = this.player2.findCardByName('the-way-of-peace');
                this.hotaru = this.player2.findCardByName('doji-hotaru');
                this.kaezin = this.player2.findCardByName('kakita-kaezin');
            });

            it('should interrupt on breaking', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    province: this.wayOfPeace,
                    attackers: [this.attendant],
                    defenders: []
                });
                this.noMoreActions();

                expect(this.player2).toHavePrompt('triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.wayOfPeace);
            });

            it('it should be able to select any character', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    province: this.wayOfPeace,
                    attackers: [this.attendant],
                    defenders: []
                });
                this.noMoreActions();

                expect(this.player2).toHavePrompt('triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.wayOfPeace);
                this.player2.clickCard(this.wayOfPeace);

                expect(this.player2).toBeAbleToSelect(this.attendant);
                expect(this.player2).toBeAbleToSelect(this.hotaru);
                expect(this.player2).toBeAbleToSelect(this.kaezin);
            });

            it('it should be able to honor 1', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    province: this.wayOfPeace,
                    attackers: [this.attendant],
                    defenders: []
                });
                this.noMoreActions();

                expect(this.player2).toHavePrompt('triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.wayOfPeace);
                this.player2.clickCard(this.wayOfPeace);

                this.player2.clickCard(this.attendant);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');
                expect(this.attendant.isHonored).toBe(true);
            });

            it('it should be able to honor 2', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    province: this.wayOfPeace,
                    attackers: [this.attendant],
                    defenders: []
                });
                this.noMoreActions();

                expect(this.player2).toHavePrompt('triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.wayOfPeace);
                this.player2.clickCard(this.wayOfPeace);

                this.player2.clickCard(this.attendant);
                this.player2.clickCard(this.hotaru);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');
                expect(this.attendant.isHonored).toBe(true);
                expect(this.hotaru.isHonored).toBe(true);
            });

            it('it should be able to honor 3', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    province: this.wayOfPeace,
                    attackers: [this.attendant],
                    defenders: []
                });
                this.noMoreActions();

                expect(this.player2).toHavePrompt('triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.wayOfPeace);
                this.player2.clickCard(this.wayOfPeace);

                this.player2.clickCard(this.attendant);
                this.player2.clickCard(this.hotaru);
                this.player2.clickCard(this.kaezin);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');
                expect(this.attendant.isHonored).toBe(true);
                expect(this.hotaru.isHonored).toBe(true);
                expect(this.kaezin.isHonored).toBe(true);
            });
        });
    });
});
