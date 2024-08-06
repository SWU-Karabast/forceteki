describe('Cloak of Night', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-the-waves', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['shepherd-of-visages']
                }
            });
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.whisperer = this.player1.findCardByName('doji-whisperer');

            this.shepherd = this.player2.findCardByName('shepherd-of-visages');
            this.noMoreActions();
        });

        it('should allow choosing a participating character', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.adept],
                defenders: [this.shepherd],
                ring: 'void'
            });
            this.player2.clickCard(this.shepherd);
            expect(this.player2).toBeAbleToSelect(this.adept);
            expect(this.player2).toBeAbleToSelect(this.shepherd);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
        });

        it('should give the chosen character -2 glory', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.adept],
                defenders: [],
                ring: 'void'
            });
            this.glory = this.adept.glory;
            this.player2.clickCard(this.shepherd);
            this.player2.clickCard(this.adept);

            expect(this.adept.glory).toBe(this.glory - 2);
        });
    });
});
