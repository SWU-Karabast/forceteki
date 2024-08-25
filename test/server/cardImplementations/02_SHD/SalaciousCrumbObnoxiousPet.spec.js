describe('Salacious Crumb, Obnoxious Pet', function() {
    integration(function() {
        describe('Crumb\'s when played ability', function() {
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
            });

            it('should heal 1 from friendly base', function () {
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

        describe('Crumb\'s action ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['salacious-crumb#obnoxious-pet', 'wampa'],
                    },
                    player2: {
                        groundArena: ['frontier-atrt'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.crumb = this.player1.findCardByName('salacious-crumb#obnoxious-pet');
                this.wampa = this.player1.findCardByName('wampa');
                this.atrt = this.player2.findCardByName('frontier-atrt');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');

                this.noMoreActions();
            });

            it('should deal 1 damage to any selected ground unit', function () {
                this.player1.clickCard(this.crumb);
                this.player1.clickPrompt('Deal 1 damage to a ground unit');

                // can target any ground unit
                expect(this.player1).toBeAbleToSelectExactly([this.atrt, this.wampa]);

                this.player1.clickCard(this.atrt);
                expect(this.atrt.damage).toBe(1);
                expect(this.crumb.location).toBe('hand');
            });

            it('should not be available if Crumb is exhausted', function () {
                this.crumb.exhausted = true;
                expect(this.crumb).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });
    });
});
