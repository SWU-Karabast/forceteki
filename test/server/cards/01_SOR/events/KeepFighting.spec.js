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
                this.pykeSentinel.exhausted = true;
                this.wampa.exhausted = true;

                // ready pyke sentinel (sabine is not exhausted and wampa is too powerful)
                this.player1.clickCard(this.keepFighting);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.imperialInterceptor]);
                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.exhausted).toBeFalse();
                expect(this.keepFighting.location).toBe('discard');
                this.player2.passAction();

                // attack again with pyke sentinel
                this.player1.clickCard(this.pykeSentinel);
                this.player1.clickCard(this.p2Base);

                // damage should be 2 here
                expect(this.p2Base.damage).toBe(2);
                expect(this.pykeSentinel.exhausted).toBeTrue();
            });

            it('should not ready an unexhausted unit', function () {
                this.player1.clickCard(this.keepFighting);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.sabineWren, this.imperialInterceptor]);
                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.exhausted).toBeFalse();
                expect(this.keepFighting.location).toBe('discard');
                this.player2.passAction();

                // attack again with pyke sentinel
                this.player1.clickCard(this.pykeSentinel);
                this.player1.clickCard(this.p2Base);

                // damage should be 2 here
                expect(this.p2Base.damage).toBe(2);
                expect(this.pykeSentinel.exhausted).toBeTrue();
            });
        });
    });
});
