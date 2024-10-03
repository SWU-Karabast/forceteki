describe('Covert Strength', function () {
    integration(function () {
        describe('Covert Strength\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-glory'],
                        groundArena: [{ card: 'pyke-sentinel' }],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can buff a unit', function () {
                this.player1.clickCard(this.momentOfGlory);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.sabineWren, this.wampa, this.imperialInterceptor]);

                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.getPower()).toBe(6);
                expect(this.pykeSentinel.getHp()).toBe(7);

                this.player2.clickCard(this.atst);
                // pyke sentinel is automatically choose
                expect(this.atst.damage).toBe(6);
                expect(this.pykeSentinel.damage).toBe(6);
                expect(this.pykeSentinel).toBeInLocation('ground arena');
            });
        });
    });
});
