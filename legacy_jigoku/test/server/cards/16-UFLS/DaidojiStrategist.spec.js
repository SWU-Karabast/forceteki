describe('Daidoji Strategist', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['daidoji-strategist', 'solemn-scholar']
                },
                player2: {
                    inPlay: ['honest-challenger', 'shrine-maiden', 'shiba-tetsu']
                }
            });

            this.daidoji = this.player1.findCardByName('daidoji-strategist');
            this.honestChallenger = this.player2.findCardByName('honest-challenger');
            this.solemnScholar = this.player1.findCardByName('solemn-scholar');
            this.shrineMaiden = this.player2.findCardByName('shrine-maiden');
            this.tetsu = this.player2.findCardByName('shiba-tetsu');

            this.shrineMaiden.honor();
            this.solemnScholar.honor();
            this.daidoji.dishonor();
            this.daidoji.taint();
        });

        it('should send home an honored character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.daidoji],
                defenders: [this.honestChallenger, this.shrineMaiden]
            });

            this.player2.pass();
            this.player1.clickCard(this.daidoji);
            expect(this.player1).toHavePrompt('Daidoji Strategist');
            expect(this.player1).not.toBeAbleToSelect(this.daidoji);
            expect(this.player1).not.toBeAbleToSelect(this.honestChallenger);
            expect(this.player1).toBeAbleToSelect(this.shrineMaiden);
            expect(this.player1).not.toBeAbleToSelect(this.solemnScholar);
            this.player1.clickCard(this.shrineMaiden);
            expect(this.shrineMaiden.inConflict).toBe(false);
        });

        it('shouldn\'t work if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.solemnScholar],
                defenders: [this.honestChallenger, this.shrineMaiden]
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.daidoji);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
