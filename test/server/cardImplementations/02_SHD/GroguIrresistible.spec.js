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

                this.grogu = this.player1.findCardByName('grogu#irresistible');
                this.wampa = this.player1.findCardByName('wampa');
                this.atrt = this.player2.findCardByName('frontier-atrt');
                this.enfysNest = this.player2.findCardByName('enfys-nest#marauder');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('should exhaust a selected enemy unit', function () {
                this.player1.clickCard(this.grogu);
                this.player1.clickPrompt('Exhaust an enemy unit');

                // TODO: convert specs to ts
                // can target opponent's units only
                expect(this.player1).toBeAbleToSelectAllOf([this.atrt, this.enfysNest]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.p1Base, this.p2Base, this.grogu, this.wampa]);

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
