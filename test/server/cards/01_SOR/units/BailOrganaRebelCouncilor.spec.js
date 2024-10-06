describe('Bail Organa', function () {
    integration(function () {
        describe('Bail Organa\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bail-organa#rebel-councilor', 'battlefield-marine'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut']
                    }
                });
            });

            it('should give an Experience to an another friendly unit', function () {
                this.player1.clickCard(this.bailOrgana);
                this.player1.clickPrompt('Give an Experience token to another friendly unit');
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.redThree]);

                this.player1.clickCard(this.battlefieldMarine);
                expect(this.bailOrgana.exhausted).toBeTrue();
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
