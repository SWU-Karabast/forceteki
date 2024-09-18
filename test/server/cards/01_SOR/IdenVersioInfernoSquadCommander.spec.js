describe('Iden Version, Inferno Squad Commander', function() {
    integration(function() {
        describe('Iden\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: 'iden-versio#inferno-squad-commander',
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'atst'],
                    }
                });
            });

            it('should heal 1 from base ', function () {
                // case 1: nothing happens, no cards defeated
                this.player1.clickCard(this.idenVersio);
                this.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                expect(this.idenVersio.exhausted).toBe(true);
                expect(this.p1Base.damage).toBe(5);

                this.idenVersio.exhausted = false;
                this.player2.passAction();

                // case 2: friendly unit defeated
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.atst);
                this.player2.passAction();

                this.player1.clickCard(this.idenVersio);
                this.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                expect(this.idenVersio.exhausted).toBe(true);
                expect(this.p1Base.damage).toBe(5);
            });
        });
    });
});
