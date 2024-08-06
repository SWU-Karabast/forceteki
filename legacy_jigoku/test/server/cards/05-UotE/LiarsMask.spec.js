describe('Liar\'s Mask', function () {
    integration(function () {
        describe('Liar\'s Mask\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['bayushi-liar'],
                        hand: ['liar-s-mask']
                    },
                    player2: {
                        inPlay: ['doji-whisperer'],
                        hand: ['steward-of-law']
                    }
                });
                this.mask = this.player1.findCardByName('liar-s-mask');
                this.liar = this.player1.findCardByName('bayushi-liar');
            });

            it('should not be attachable if honor is above 6', function () {
                this.player1.honor = 7;
                this.player1.clickCard(this.mask);
                expect(this.player1).not.toBeAbleToSelect(this.liar);
            });

            it('should be attachable if honor is below or at 6', function () {
                this.player1.honor = 5;
                this.player1.clickCard(this.mask);
                expect(this.player1).toBeAbleToSelect(this.liar);
                this.player1.clickCard(this.liar);
                expect(this.liar.attachments).toContain(this.mask);
            });

            it('should correctly discard status token', function () {
                this.player1.honor = 5;
                this.liar.dishonor();
                this.player1.clickCard(this.mask);
                this.player1.clickCard(this.liar);
                expect(this.liar.attachments).toContain(this.mask);
                this.player2.pass();
                this.player1.clickCard(this.mask);
                expect(this.liar.isDishonored).toBe(false);
            });

            it('should prompt you to choose which status token to discard if there are multiples', function () {
                this.player1.honor = 5;
                this.liar.dishonor();
                this.liar.taint();
                this.player1.clickCard(this.mask);
                this.player1.clickCard(this.liar);
                expect(this.liar.attachments).toContain(this.mask);
                this.player2.pass();
                this.player1.clickCard(this.mask);

                expect(this.player1).toHavePrompt('Which token do you wish to discard?');
                expect(this.player1).toHavePromptButton('Dishonored Token');
                expect(this.player1).toHavePromptButton('Tainted Token');
                this.player1.clickPrompt('Tainted Token');

                expect(this.liar.isDishonored).toBe(true);
                expect(this.liar.isTainted).toBe(false);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Liar\'s Mask to discard a status token from Bayushi Liar'
                );
                expect(this.getChatLogs(5)).toContain('player1 discards Tainted Token');
            });

            it('should work if steward of law is participating in a conflict and attached char is honored', function () {
                this.player1.honor = 5;
                this.liar.honor();
                this.player1.clickCard(this.mask);
                this.player1.clickCard(this.liar);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.liar],
                    defenders: []
                });
                this.player2.clickCard('steward-of-law');
                this.player2.clickPrompt('0');
                this.player2.clickPrompt('Conflict');
                this.player1.clickCard(this.mask);
                expect(this.liar.isHonored).toBe(false);
            });
        });
    });
});
