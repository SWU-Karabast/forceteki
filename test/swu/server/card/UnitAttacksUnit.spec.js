describe('Basic attack', function() {
    integration(function() {
        describe('When a unit attacks', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        resources: ['atst', 'atst'],
                    },
                    player2: {
                        groundArena: ['frontier-atrt', 'enfys-nest#marauder'],
                        resources: ['atst', 'atst']     // TODO: allow resources to be optionally be specified as a number instead of naming specific cards (i.e., 2 resources)
                    }
                });
                this.wampa = this.player1.findCardByName('wampa');
                this.atrt = this.player2.findCardByName('frontier-atrt');
                this.enfysNest = this.player2.findCardByName('enfys-nest#marauder');

                this.noMoreActions();
            });

            it(', should only be able to select opponent\'s units', function () {
                this.player1.clickCard(this.wampa);
                expect(this.player1).toHavePrompt('Choose a target for attack');
                expect(this.player1).toBeAbleToSelect(this.atrt);
                expect(this.player1).toBeAbleToSelect(this.enfysNest);
                expect(this.player1).not.toBeAbleToSelect(this.wampa);
            });

            it('another unit and neither is defeated, both should receive damage and attacker should be exhausted', function () {
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.atrt);

                expect(this.wampa.damage).toBe(3);
                expect(this.atrt.damage).toBe(4);
                expect(this.wampa.exhausted).toBe(true);
                expect(this.atrt.exhausted).toBe(false);
            });

            it('another unit and both are defeated, both should be in discard', function () {
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.enfysNest);

                expect(this.wampa.damage).toBe(null);
                expect(this.wampa.exhausted).toBe(null);
                expect(this.wampa.location).toBe('discard');

                expect(this.enfysNest.damage).toBe(null);
                expect(this.enfysNest.exhausted).toBe(null);
                expect(this.enfysNest.location).toBe('discard');
            });
        });
    });
});
