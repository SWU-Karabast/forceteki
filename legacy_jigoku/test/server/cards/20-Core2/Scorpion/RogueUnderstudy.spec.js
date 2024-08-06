describe('Rogue Understudy', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['rogue-understudy']
                }
            });

            this.rogueUnderstudy = this.player1.findCardByName('rogue-understudy');
            this.rogueUnderstudy.bowed = true;
        });

        it('should ready itself', function () {
            this.player1.clickCard(this.rogueUnderstudy);
            expect(this.rogueUnderstudy.bowed).toBe(false);
        });
    });
});
