describe('Keep Fighting', function () {
    integration(function () {
        describe('Keep Fighting\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['keep-fighting'],
                        groundArena: ['pyke-sentinel', 'wampa'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('should ready a unit', function () {
                // attack with pyke sentinel (2/3)
                this.player1.clickCard(this.pykeSentinel);
                this.player1.clickCard(this.p2Base);
                expect(this.pykeSentinel.exhausted).toBeTrue();
                expect(this.player2).toBeActivePlayer();
                this.player2.pass();

                // attack with wampa (4/5)
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.p2Base);
                expect(this.wampa.exhausted).toBeTrue();
                expect(this.player2).toBeActivePlayer();
                this.player2.pass();

                // ready pyke sentinel (sabine is not exhausted and wampa is too powerful)
                this.player1.clickCard(this.keepFighting);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.imperialInterceptor]);
                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.exhausted).toBeFalse();
                expect(this.keepFighting.location).toBe('discard');
                this.player2.pass();

                // attack again with pyke sentinel
                this.player1.clickCard(this.pykeSentinel);
                this.player1.clickCard(this.p2Base);

                // damage should be 8 here
                expect(this.p2Base.damage).toBe(8);
                expect(this.pykeSentinel.exhausted).toBeTrue();
            });
        });
    });
});
