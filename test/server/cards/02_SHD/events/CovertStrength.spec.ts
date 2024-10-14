describe('Covert Strength', function () {
    integration(function () {
        describe('Covert Strength\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['covert-strength'],
                        groundArena: [{ card: 'pyke-sentinel', damage: 1 }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can heal a unit', function () {
                this.player1.clickCard(this.covertStrength);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.cartelSpacer, this.wampa, this.imperialInterceptor]);

                this.player1.clickCard(this.sabineWren);
                expect(this.sabineWren.damage).toBe(2);
                expect(this.sabineWren).toHaveExactUpgradeNames(['experience']);
            });

            it('can fully-heal a unit', function () {
                this.player1.clickCard(this.covertStrength);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.cartelSpacer, this.wampa, this.imperialInterceptor]);

                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.damage).toBe(0);
                expect(this.pykeSentinel).toHaveExactUpgradeNames(['experience']);
            });

            it('can select a target with no damage', function () {
                this.player1.clickCard(this.covertStrength);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.cartelSpacer, this.wampa, this.imperialInterceptor]);

                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.cartelSpacer).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
