describe('Master of the Court', function() {
    integration(function() {
        describe('Master of the Court', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-whisperer'],
                        hand: ['way-of-the-crane', 'backhanded-compliment']
                    },
                    player2: {
                        inPlay: ['master-of-the-court', 'doji-challenger']
                    }
                });
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.master = this.player2.findCardByName('master-of-the-court');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.crane = this.player1.findCardByName('way-of-the-crane');
                this.bhc = this.player1.findCardByName('backhanded-compliment');

                this.challenger.honor();
            });

            it('should allow events to be cancelled if honored', function() {
                this.master.honor();
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.master);
            });

            it('should not allow events to be cancelled if not honored', function() {
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
            });

            it('should cancel the event and disard the status token', function() {
                this.master.honor();
                expect(this.master.isHonored).toBe(true);
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.master);
                this.player2.clickCard(this.master);
                expect(this.whisperer.isHonored).toBe(false);
                expect(this.master.isHonored).toBe(false);
                expect(this.getChatLogs(3)).toContain('player2 uses Master of the Court, discarding a status token to cancel the effects of Way of the Crane');
            });
        });
    });
});
