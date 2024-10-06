describe('Maximum Firepower', function() {
    integration(function () {
        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower'],
                        groundArena: ['death-trooper'],
                        spaceArena: ['tieln-fighter', 'gladiator-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should deal 5 damage to wampa and friendly units aren\'t exhausted', function () {
                // action play Maximum Firepower
                this.player1.clickCard(this.maximumFirepower);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.deathTrooper);

                // action check if wampa can be selected
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.wampa);

                // third action set
                expect(this.wampa.location).toBe('ground arena');
                // since there is nothing else to be selected it selects tieln-fighter and deals damage
                expect(this.player1).toBeAbleToSelectExactly([this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.tielnFighter);
                // expect(this.deathTrooper).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});