describe('Priviledged Position', function() {
    integration(function() {
        describe('Priviledged Position\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['kakita-kaezin'],
                        hand: ['privileged-position']
                    },
                    player2: {
                        inPlay: ['brash-samurai']
                    }
                });
                this.position = this.player1.findCardByName('privileged-position');
                this.kaezin = this.player1.findCardByName('kakita-kaezin');
                this.brash = this.player2.findCardByName('brash-samurai');
            });

            it('should trigger when your opponent bids higher and reduce opponent to 1 conflict opportunity', function() {
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('2');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.position);
                this.player1.clickCard(this.position);
                expect(this.player1.player.getConflictOpportunities()).toBe(2);
                expect(this.player2.player.getConflictOpportunities()).toBe(1);
                expect(this.getChatLogs(4)).toContain('player1 plays Privileged Position to limit player2 to a single conflict this turn');
            });

            it('should not trigger when bids are equal and reduce opponent to 1 conflict opportunity', function() {
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });

            it('should not trigger when your opponent bids lower and reduce opponent to 1 conflict opportunity', function() {
                this.player1.clickPrompt('2');
                this.player2.clickPrompt('1');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });

            it('should trigger on a duel and remove your opponents last conflict choice', function() {
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.noMoreActions();
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.brash],
                    defenders: [this.kaezin],
                    type: 'political'
                });

                this.player1.clickCard(this.kaezin);
                this.player2.clickCard(this.brash);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('2');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.position);
                this.player1.clickCard(this.position);
                expect(this.player1.player.getConflictOpportunities()).toBe(1);
                expect(this.player2.player.getConflictOpportunities()).toBe(0);
            });
        });
    });
});
