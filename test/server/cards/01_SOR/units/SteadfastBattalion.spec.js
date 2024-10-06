describe('Steadfast Battalion', function () {
    integration(function () {
        describe('Steadfast Battalion\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                        leader: { card: 'ig88#ruthless-bounty-hunter', deployed: true }
                    },
                    player2: {}
                });
            });

            it('should give a unit +2/+2 if you control a leader unit', function () {
                this.player1.clickCard(this.steadfastBattalion);
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.battlefieldMarine.getPower()).toBe(5);

                this.player2.pass();
                this.player1.clickCard(this.battlefieldMarine);
                // steadfast battalion: 5 + battlefieldMarine: 3+2 = 10
                expect(this.p2Base.damage).toBe(10);
            });
        });

        describe('Steadfast Battalion\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                    },
                    player2: {}
                });
            });

            it('should not give a unit +2/+2 if you do not control a leader unit', function () {
                this.player1.clickCard(this.steadfastBattalion);
                expect(this.battlefieldMarine.getPower()).toBe(3);

                this.player2.pass();
                this.player1.clickCard(this.battlefieldMarine);
                // steadfast battalion: 5 + battlefieldMarine: 3 = 8
                expect(this.p2Base.damage).toBe(8);
            });
        });
    });
});
