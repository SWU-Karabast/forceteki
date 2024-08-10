describe('Salacious Crumb, Obnoxious Pet', function() {
    integration(function() {
        describe('Crumb', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['salacious-crumb#obnoxious-pet'],
                        leader: ['jabba-the-hutt#his-high-exaltedness'],
                        resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    }
                });

                this.crumb = this.player1.findCardByName('salacious-crumb#obnoxious-pet');
                this.p1Base = this.player1.base;

                this.noMoreActions();

                // crumb is only partially implemented, still need to handle the activated ability
            });

            it('should heal 1 from friendly base when played', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.crumb);
                expect(this.crumb.location).toBe('ground arena');

                expect(this.p1Base.damage).toBe(4);
            });

            it('should heal 0 from base if base has no damage', function () {
                this.p1Base.damage = 0;
                this.player1.clickCard(this.crumb);
                expect(this.crumb.location).toBe('ground arena');

                expect(this.p1Base.damage).toBe(0);
            });
        });
    });
});
