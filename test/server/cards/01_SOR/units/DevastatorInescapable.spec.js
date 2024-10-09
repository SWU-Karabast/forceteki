describe('Devastator', function () {
    integration(function () {
        describe('Devastator\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#inescapable'],
                        groundArena: ['seasoned-shoretrooper'],
                        // 14 resources
                        resources: 14
                    },
                    player2: {
                        groundArena: [{
                            // should be 15 hp
                            card: 'rugged-survivors', upgrades: ['entrenched', 'entrenched', 'entrenched', 'experience']
                        }]
                    }
                });
            });

            it('should buff him with 6 or more resources', function () {
                this.player1.clickCard(this.devastator);
                expect(this.player1).toBeAbleToSelectExactly([this.devastator, this.seasonedShoretrooper, this.ruggedSurvivors]);
                expect(this.player1).toHavePassAbilityButton();

                this.player1.clickCard(this.ruggedSurvivors);
                expect(this.ruggedSurvivors.damage).toBe(14);
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
