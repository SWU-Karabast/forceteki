describe('Protector', function() {
    integration(function() {
        describe('Protector\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: [{ card: 'snowspeeder', upgrades: ['protector'] }]
                    }
                });
            });

            it('should be sentinel', function () {
                this.player1.clickCard(this.battlefieldMarine);
                //Snowspeeder automatically selected due to sentinel
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
