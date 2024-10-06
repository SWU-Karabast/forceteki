describe('Maximum Firepower', function() {
    integration(function () {
        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower'],
                        groundArena: ['death-trooper'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should deal 5 damage to wampa and friendly units aren\'t exhausted', function () {
                // action play Maximum Firepower
                this.player1.clickCard(this.maximumFirepower);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.tielnFighter]);
            });
        });
    });
});