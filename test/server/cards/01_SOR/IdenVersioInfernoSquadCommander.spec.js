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

            it('should heal 1 from if an opponent\'s unit was defeated this phase', function () {
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

                this.idenVersio.exhausted = false;
                this.player2.passAction();

                // case 3: enemy unit defeated
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.specforceSoldier);
                this.player2.passAction();

                this.player1.clickCard(this.idenVersio);
                this.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                expect(this.idenVersio.exhausted).toBe(true);
                expect(this.p1Base.damage).toBe(4);

                // case 4: next action phase, ability should no longer be active
                this.moveToNextActionPhase();
                this.player1.clickCard(this.idenVersio);
                this.player1.clickPrompt('Heal 1 from base if an opponent\'s unit was defeated this phase');
                expect(this.idenVersio.exhausted).toBe(true);
                expect(this.p1Base.damage).toBe(4);
            });
        });

        describe('Iden\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'atst'],
                    }
                });
            });

            it('should heal 1 from base when an enemy unit is defeated', function () {
                // case 1: friendly unit defeated
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.atst);
                expect(this.p1Base.damage).toBe(5);

                this.player2.passAction();

                // case 2: enemy unit defeated
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.specforceSoldier);
                expect(this.p1Base.damage).toBe(4);
            });

            // TODO: once leader shields and defeat timing is fixed, add a test for Iden's ability to heal base when she is defeated
            // TODO: once defeat timing is fixed, add a test checking that Iden's ability functions correctly with parallel defeats (e.g. superlaser)
        });
    });
});
