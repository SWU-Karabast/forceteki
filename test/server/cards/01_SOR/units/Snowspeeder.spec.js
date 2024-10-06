describe('Snowspeeder', function() {
    integration(function () {
        describe('Snowspeeder\'s ability -', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['snowspeeder'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['cell-block-guard', 'atst', 'occupier-siege-tank']
                    }
                });
            });

            it('should exhaust chosen enemy Vehicle ground unit', function() {
                this.player1.clickCard(this.snowspeeder);
                this.player1.clickPrompt('Ambush');
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.occupierSiegeTank]);

                this.player1.clickCard(this.atst);

                expect(this.atst.exhausted).toBe(true);
            });
        });
    });
});
