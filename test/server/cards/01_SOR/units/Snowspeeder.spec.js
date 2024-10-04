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
                        deck: ['occupier-siege-tank'],
                        groundArena: ['cell-block-guard', 'atst']
                    }
                });
            });

            it('should exhaust an enemy Vehicle ground unit', function() {
                this.player1.clickCard(this.snowspeeder);
                this.player1.clickPrompt('Ambush');

                expect(this.atst.exhausted).toBe(true);
            });

            describe('when multiple valid targets,', function() {
                it('should exhaust chosen enemy Vehicle ground unit', function() {
                    this.player2.setGroundArenaUnits(['cell-block-guard', 'atst', 'occupier-siege-tank']);

                    this.player1.clickCard(this.snowspeeder);
                    this.player1.clickPrompt('Ambush');
                    expect(this.player1).toBeAbleToSelectExactly([this.atst, this.occupierSiegeTank]);

                    this.player1.clickCard(this.atst);

                    expect(this.atst.exhausted).toBe(true);
                });
            });
        });
    });
});
