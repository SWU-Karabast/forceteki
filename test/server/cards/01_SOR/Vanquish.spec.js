describe('Vanquish', function() {
    integration(function() {
        describe('Vanquish\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            // TODO LEADERS: add a leader unit to confirm it can't be targeted
            it('should defeat any non-leader unit', function () {
                this.player1.clickCard(this.vanquish);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.wampa, this.imperialInterceptor]);

                this.player1.clickCard(this.imperialInterceptor);
                expect(this.imperialInterceptor).toBeInLocation('discard');
            });
        });
    });
});
