describe('Seeking Enlightenment', function() {
    integration(function() {
        describe('Vassal Fields\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kitsuki-yaruma', 'doji-challenger'],
                        fate: 10
                    },
                    player2: {
                        provinces: ['seeking-enlightenment'],
                        fate: 11
                    }
                });
                this.yaruma = this.player1.findCardByName('kitsuki-yaruma');
                this.challenger = this.player1.findCardByName('doji-challenger');

                this.seeking = this.player2.findCardByName('seeking-enlightenment');

            });

            it('should make the opponent lose 1 fate if there is one attacker', function() {
                this.noMoreActions();
                expect(this.seeking.facedown).toBe(true);

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.yaruma],
                    province: this.seeking
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.seeking);
                this.player2.clickCard(this.seeking);
                expect(this.player1.fate).toBe(9);
                expect(this.player2.fate).toBe(11);
            });

            it('should make the opponent lose fate equal to the number of attackers', function() {
                this.noMoreActions();
                expect(this.seeking.facedown).toBe(true);

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.yaruma, this.challenger],
                    province: this.seeking
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.seeking);
                this.player2.clickCard(this.seeking);
                expect(this.player1.fate).toBe(8);
                expect(this.player2.fate).toBe(11);
                expect(this.getChatLogs(10)).toContain('player2 uses Seeking Enlightenment to make player1 lose 2 fate');

            });
        });
    });
});
