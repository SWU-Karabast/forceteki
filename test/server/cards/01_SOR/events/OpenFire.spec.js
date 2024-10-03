describe('Open Fire', function() {
    integration(function() {
        describe('Open Fire\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', { card: 'fleet-lieutenant', upgrades: ['experience', 'experience'] }],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }]
                    }
                });
            });

            // Base Damage is not allowed and thus is tested in the Select Exactly
            // Similarly this should allow for units behind a sentinal to be selected

            it('can damage a unit with a shield, removing only the shield', function () {
                this.player1.clickCard(this.openFire);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.cartelSpacer, this.pykeSentinel, this.fleetLieutenant]);

                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer).toHaveExactUpgradeNames([]);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.cartelSpacer).toBeInLocation('space arena', this.player2);
            });

            it('can damage a unit without a shield, dealing damage to the unit with health to spare', function () {
                this.player1.clickCard(this.openFire);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.cartelSpacer, this.pykeSentinel, this.fleetLieutenant]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(4);
            });
        });
    });
});