describe('Lion\'s Pride Paragon', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor:10,
                    inPlay: ['lion-s-pride-paragon']
                },
                player2: {
                    honor:14,
                    inPlay: ['lion-s-pride-paragon']
                }
            });

            this.paragonOne = this.player1.findCardByName('lion-s-pride-paragon');
            this.paragonOne.fate = 0;
            this.paragon2 = this.player2.findCardByName('lion-s-pride-paragon');
            this.paragon2.fate = 1;
            this.noMoreActions();
        });

        it('should not bow if Dire', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.paragonOne],
                defenders: [this.paragon2]
            });

            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.paragonOne.bowed).toBe(false);
        });

        it('should bow if not Dire', function() {
            this.initiateConflict({
                type: 'military',
                attackers: [this.paragonOne],
                defenders: [this.paragon2]
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Don\'t Resolve');
            this.game.checkGameState(true);
            expect(this.paragon2.fate).toBe(1);
            expect(this.paragon2.bowed).toBe(true);
        });
    });
});
