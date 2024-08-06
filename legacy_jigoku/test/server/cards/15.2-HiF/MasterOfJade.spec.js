describe('Master of Jade', function() {
    integration(function() {
        describe('Master of Jade\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['moto-horde', 'shinjo-outrider']
                    },
                    player2: {
                        inPlay: ['master-of-jade', 'doomed-shugenja'],
                        hand: ['charge', 'assassination', 'fine-katana'],
                        honor: 10
                    }
                });
                this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
                this.horde = this.player1.findCardByName('moto-horde');
                this.shinjoOutrider = this.player1.findCardByName('shinjo-outrider');
                this.master = this.player2.findCardByName('master-of-jade');
                this.player1.pass();
            });

            it('should allow the ability to be used on any character', function() {
                let fate = this.shinjoOutrider.fate;
                this.player2.clickCard(this.master);
                expect(this.player2).toBeAbleToSelect(this.shinjoOutrider);
                this.player2.clickCard(this.shinjoOutrider);
                expect(this.shinjoOutrider.fate).toBe(fate + 1);
                expect(this.getChatLogs(10)).toContain('player2 uses Master of Jade, losing 2 honor to place 1 fate on Shinjo Outrider');

            });

            it('should cost 2 honor', function() {
                let honor = this.player2.honor;
                this.player2.clickCard(this.master);
                expect(this.player2).toBeAbleToSelect(this.shinjoOutrider);
                this.player2.clickCard(this.shinjoOutrider);
                expect(this.player2.honor).toBe(honor - 2);
            });

            it('should allow the ability to be used to place fate on Doomed Shugenja', function() {
                let fate = this.doomedShugenja.fate;
                this.player2.clickCard(this.master);
                expect(this.player2).toBeAbleToSelect(this.doomedShugenja);
                this.player2.clickCard(this.doomedShugenja);
                expect(this.doomedShugenja.fate).toBe(fate + 1);
            });
        });
    });
});

