describe('Grogu, Irresistible', function() {
    integration(function() {
        describe('Grogu\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['grogu#irresistible', 'wampa'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', exhausted: true },
                            'enfys-nest#marauder'
                        ],
                    }
                });
            });

            it('should exhaust a selected enemy unit', function () {
                this.player1.clickCard(this.grogu);
                this.player1.clickPrompt('Exhaust an enemy unit');

                // can target opponent's units only
                expect(this.player1).toBeAbleToSelectExactly([this.frontierAtrt, this.enfysNest]);

                this.player1.clickCard(this.enfysNest);
                expect(this.grogu.exhausted).toBe(true);
                expect(this.enfysNest.exhausted).toBe(true);
            });

            // this is a general test of the exhaustSelf cost mechanic, don't need to repeat it for other cards that have an exhaustSelf cost
            it('should not be available if Grogu is exhausted', function () {
                this.grogu.exhausted = true;
                expect(this.grogu).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });
    });
});
