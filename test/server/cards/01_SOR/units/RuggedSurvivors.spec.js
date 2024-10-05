describe('Rugged Survivors', function () {
    integration(function () {
        describe('Rugged Survivors\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                        leader: { card: 'ig88#ruthless-bounty-hunter', deployed: true }
                    },
                    player2: {}
                });
            });

            it('should draw if you control a deployed leader unit', function () {
                this.player1.clickCard(this.ruggedSurvivors);
                expect(this.player1).toHavePassAbilityPrompt('Draw a card if you control a leader unit');
                this.player1.clickPrompt('Draw a card if you control a leader unit');

                expect(this.player1.hand.length).toBe(1);
                expect(this.player2.hand.length).toBe(0);
                expect(this.p2Base.damage).toBe(3);
            });
        });

        describe('Rugged Survivors\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                    },
                    player2: {}
                });
            });

            it('should not draw if you do not control a deployed leader unit', function () {
                this.player1.clickCard(this.ruggedSurvivors);
                expect(this.player2).toBeActivePlayer();
                expect(this.player1.hand.length).toBe(0);
                expect(this.player2.hand.length).toBe(0);
            });
        });
    });
});
