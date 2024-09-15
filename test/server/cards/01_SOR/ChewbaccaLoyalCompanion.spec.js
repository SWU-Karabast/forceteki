describe('Chewbacca, Loyal Companion', function() {
    integration(function() {
        describe('Chewbacca\'s when attacked ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }]
                    }
                });
            });

            it('readies Chewbacca when he is attacked', function () {
                this.player1.clickCard(this.wampa);
                //Don't need to click Chewbacca due to sentinel
                expect(this.chewbacca.exhausted).toBe(false);
            });
        });
    });
});
