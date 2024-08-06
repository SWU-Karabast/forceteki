describe('Local Daimyo\'s Retainer', function() {
    integration(function() {
        describe('Conflict Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['veteran-of-toshi-ranbo']
                    },
                    player2: {
                        inPlay: ['veteran-of-toshi-ranbo']
                    }
                });

                this.veteran1 = this.player1.findCardByName('veteran-of-toshi-ranbo');
                this.veteran2 = this.player2.findCardByName('veteran-of-toshi-ranbo');

                this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
                this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');
            });

            it('should have glory equal to the number of faceup provinces you control', function() {
                expect(this.veteran1.glory).toBe(0);
                expect(this.veteran2.glory).toBe(0);

                this.p1.facedown = false;
                this.game.checkGameState(true);
                expect(this.veteran1.glory).toBe(1);
                expect(this.veteran2.glory).toBe(0);

                this.p2.facedown = false;
                this.game.checkGameState(true);
                expect(this.veteran1.glory).toBe(2);
                expect(this.veteran2.glory).toBe(0);

                this.p3.facedown = false;
                this.game.checkGameState(true);
                expect(this.veteran1.glory).toBe(3);
                expect(this.veteran2.glory).toBe(0);

                this.p4.facedown = false;
                this.game.checkGameState(true);
                expect(this.veteran1.glory).toBe(4);
                expect(this.veteran2.glory).toBe(0);

                this.pStronghold.facedown = false;
                this.game.checkGameState(true);
                expect(this.veteran1.glory).toBe(5);
                expect(this.veteran2.glory).toBe(0);
            });
        });
    });
});
