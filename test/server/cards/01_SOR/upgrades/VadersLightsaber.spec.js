describe('Vader\'s Lightsaber', function() {
    integration(function() {
        describe('Vader\'s Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vaders-lightsaber'],
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should deal 4 damage to a ground unit when attached to the Darth Vader unit', function () {
                this.player1.clickCard(this.vadersLightsaber);
                expect(this.player1).toBeAbleToSelectExactly([this.darthVader, this.wampa]);    // cannot attach to vehicles
                this.player1.clickCard(this.darthVader);

                expect(this.darthVader).toHaveExactUpgradeNames(['vaders-lightsaber']);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.darthVader]);
                expect(this.player1).toHavePassAbilityButton();

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(4);

                expect(this.player2).toBeActivePlayer();
            });

            it('should do nothing when attached to a unit that is not Darth Vader', function () {
                this.player1.clickCard(this.vadersLightsaber);
                this.player1.clickCard(this.wampa);

                expect(this.wampa).toHaveExactUpgradeNames(['vaders-lightsaber']);
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Vader\'s Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vaders-lightsaber'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
            });

            it('should deal 4 damage to a ground unit when attached to the Darth Vader leader', function () {
                this.player1.clickCard(this.vadersLightsaber);
                this.player1.clickCard(this.darthVader);

                expect(this.darthVader).toHaveExactUpgradeNames(['vaders-lightsaber']);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.darthVader]);
                expect(this.player1).toHavePassAbilityButton();

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(4);

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
