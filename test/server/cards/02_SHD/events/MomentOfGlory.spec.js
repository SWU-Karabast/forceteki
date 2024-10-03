describe('Covert Strength', function () {
    integration(function () {
        describe('Covert Strength\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-glory'],
                        groundArena: [{ card: 'pyke-sentinel', damage: 1 }],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can buff a unit', function () {
                this.player1.clickCard(this.momentOfGlory);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.wampa, this.imperialInterceptor]);

                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.getPower()).toBe(6);
                expect(this.pykeSentinel.getHp()).toBe(7);
                expect(this.pykeSentinel.remainingHp).toBe(6);
            });
        });
    });
});
