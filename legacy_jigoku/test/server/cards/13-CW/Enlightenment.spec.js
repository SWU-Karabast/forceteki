describe('Enlightenment', function() {
    integration(function() {

        describe('Enlightenment\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-challenger', 'asako-azunami'],
                        hand: ['enlightenment']
                    },
                    player2: {
                        inPlay: ['doji-whisperer', 'brash-samurai'],
                        hand: []
                    }
                });
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.azunami = this.player1.findCardByName('asako-azunami');
                this.brash = this.player2.findCardByName('brash-samurai');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.enlightenment = this.player1.findCardByName('enlightenment');
            });

            it('should trigger all claimed rings', function() {
                this.player1.claimRing('air');
                this.player1.claimRing('fire');
                this.player1.claimRing('earth');
                this.player1.claimRing('void');

                this.player1.clickCard(this.enlightenment);
                expect(this.player1).toHavePrompt('Fire Ring');
                this.player1.clickCard(this.brash);
                this.player1.clickPrompt('Dishonor Brash Samurai');
                expect(this.player1).toHavePrompt('Air Ring');
                this.player1.clickPrompt('Gain 2 Honor');
                expect(this.getChatLogs(5)).toContain('player1 plays Enlightenment to resolve all claimed ring effects');
                expect(this.getChatLogs(4)).toContain('player1 resolves the earth ring, drawing a card and forcing player2 to discard a card at random');
                expect(this.getChatLogs(3)).toContain('player1 attempted to use Void Ring, but there are insufficient legal targets');
                expect(this.getChatLogs(2)).toContain('player1 resolves the fire ring, dishonoring Brash Samurai');
                expect(this.getChatLogs(1)).toContain('player1 resolves the air ring, gaining 2 honor');

                expect(this.player2).toHavePrompt('Action Window');
            });

            it('should allow ring replacement effects', function() {
                this.player1.claimRing('water');
                this.player1.clickCard(this.enlightenment);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.azunami);
                this.player1.clickCard(this.azunami);
                expect(this.player1).toHavePrompt('Asako Azunami');
            });

            it('should win the game', function() {
                this.player1.claimRing('air');
                this.player1.claimRing('fire');
                this.player1.claimRing('earth');
                this.player1.claimRing('void');
                this.player1.claimRing('water');

                this.player1.clickCard(this.enlightenment);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.azunami);
                this.player1.clickPrompt('Pass');
                expect(this.player1).toHavePrompt('Water Ring');
                this.player1.clickCard(this.brash);
                expect(this.player1).toHavePrompt('Fire Ring');
                this.player1.clickCard(this.brash);
                this.player1.clickPrompt('Dishonor Brash Samurai');
                expect(this.player1).toHavePrompt('Air Ring');
                this.player1.clickPrompt('Gain 2 Honor');
                expect(this.getChatLogs(7)).toContain('player1 plays Enlightenment to resolve all claimed ring effects');
                expect(this.getChatLogs(6)).toContain('player1 resolves the earth ring, drawing a card and forcing player2 to discard a card at random');
                expect(this.getChatLogs(5)).toContain('player1 attempted to use Void Ring, but there are insufficient legal targets');
                expect(this.getChatLogs(4)).toContain('player1 resolves the water ring, bowing Brash Samurai');
                expect(this.getChatLogs(3)).toContain('player1 resolves the fire ring, dishonoring Brash Samurai');
                expect(this.getChatLogs(2)).toContain('player1 resolves the air ring, gaining 2 honor');
                expect(this.getChatLogs(1)).toContain('player1 has won the game');

                expect(this.player1).toHavePrompt('player1 has won the game!');
                expect(this.player2).toHavePrompt('player1 has won the game!');
            });

            it('should not be playable if you have no claimed rings', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.enlightenment);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });
    });
});
