describe('Chewbacca, Loyal Companion', function() {
    integration(function() {
        describe('Chewbacca\'s when attacked ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['specforce-soldier', 'alliance-dispatcher']
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }]
                    }
                });
            });

            it('readies Chewbacca when he is attacked', function () {
                expect(this.chewbacca.exhausted).toBe(true);
                this.player1.clickCard(this.specforceSoldier);
                // Don't need to click Chewbacca due to sentinel
                expect(this.chewbacca.exhausted).toBe(false);

                this.player2.clickCard(this.chewbacca);
                this.player2.clickCard(this.p1Base);
                expect(this.chewbacca.exhausted).toBe(true);

                this.player1.clickCard(this.allianceDispatcher);
                expect(this.chewbacca.exhausted).toBe(false);
            });
        });
    });
});
