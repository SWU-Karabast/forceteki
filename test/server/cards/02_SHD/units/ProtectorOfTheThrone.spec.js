describe('Protector of the Throne', function() {
    integration(function() {
        describe('Protector of the Throne\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'protector-of-the-throne', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'jedha-agitator'],
                    }
                });
            });

            it('should give it sentinel only as long as it is upgraded', function () {
                this.player1.pass();

                this.player2.clickCard(this.wampa);
                // Protector of the Throne automatically selected due to sentinel

                expect(this.player1).toBeActivePlayer();
                // no damage because of shield
                expect(this.protectorOfTheThrone.damage).toBe(0);
                expect(this.protectorOfTheThrone.isUpgraded()).toBe(false);
                expect(this.wampa.damage).toBe(2);

                this.player1.pass();

                this.player2.clickCard(this.jedhaAgitator);

                // player 2 should be able to select base and unit because Protector of the Throne is not sentinel anymore
                expect(this.player2).toBeAbleToSelectExactly([this.protectorOfTheThrone, this.p1Base]);
            });
        });
    });
});
