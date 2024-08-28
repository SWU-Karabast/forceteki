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

                this.vanquish = this.player1.findCardByName('vanquish');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.wampa = this.player2.findCardByName('wampa');
                this.interceptor = this.player2.findCardByName('imperial-interceptor');
            });

            // TODO LEADERS: add a leader unit to confirm it can't be targeted
            it('should defeat any non-leader unit', function () {
                this.player1.clickCard(this.vanquish);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.wampa, this.interceptor]);

                this.player1.clickCard(this.interceptor);
                expect(this.interceptor.location).toBe('discard');
            });
        });
    });
});
