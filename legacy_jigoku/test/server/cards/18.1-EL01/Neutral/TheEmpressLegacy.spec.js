describe('The Empress\'s Legacy', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['hida-guardian', 'kakita-yoshi'],
                    hand: ['the-empress-legacy', 'severed-from-the-stream']
                }
            });
            this.legacy = this.player1.findCardByName('the-empress-legacy');
            this.guardian = this.player1.findCardByName('hida-guardian');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.stream = this.player1.findCardByName('severed-from-the-stream');
        });

        it('should contribute glory while bowed', function() {
            this.guardian.bowed = true;
            this.yoshi.bowed = true;

            this.player1.clickCard(this.legacy);
            this.player1.clickCard(this.yoshi);

            this.player2.pass();
            this.player1.clickCard(this.stream);
            expect(this.getChatLogs(5)).toContain('player1 wins the glory count 3 vs 0');
        });

        it('should give an extra glory if its on a crab character', function() {
            this.guardian.bowed = true;
            this.yoshi.bowed = true;

            this.player1.clickCard(this.legacy);
            this.player1.clickCard(this.guardian);

            this.player2.pass();
            this.player1.clickCard(this.stream);
            expect(this.getChatLogs(5)).toContain('player1 wins the glory count 2 vs 0');
        });
    });
});
