describe('Benthic Two Tubes', function() {
    integration(function() {
        describe('Benthic Two Tubes\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#partisan-lieutenant', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should give Raid 2 to another Aggression ally', function () {
                this.player1.clickCard(this.benthicTwoTubes);
                this.player1.clickCard(this.p2Base);
                // a wing is automatically chosen
                this.player2.passAction();

                this.player1.clickCard(this.greenSquadronAwing);
                // benthic: 2 + a wing: 3+2
                expect(this.p2Base.damage).toBe(7);
            });
        });
    });
});
