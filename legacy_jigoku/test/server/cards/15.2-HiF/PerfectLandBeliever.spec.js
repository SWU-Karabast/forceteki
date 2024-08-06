describe('Perfect Land Believer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['perfect-land-believer']
                }
            });

            this.plb = this.player1.findCardByName('perfect-land-believer');

        });

        it('should be a 3/2 when ordinary', function () {
            expect(this.plb.militarySkill).toBe(3);
            expect(this.plb.politicalSkill).toBe(2);

            this.plb.honor();
            this.game.checkGameState(true);

            expect(this.plb.militarySkill).toBe(1);
            expect(this.plb.politicalSkill).toBe(0);

            this.plb.dishonor();
            this.game.checkGameState(true);

            expect(this.plb.militarySkill).toBe(3);
            expect(this.plb.politicalSkill).toBe(2);

            this.plb.dishonor();
            this.game.checkGameState(true);

            expect(this.plb.militarySkill).toBe(1);
            expect(this.plb.politicalSkill).toBe(0);
        });
    });
});
