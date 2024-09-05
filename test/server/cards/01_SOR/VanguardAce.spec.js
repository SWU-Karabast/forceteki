describe('Vanguard Ace', function() {
    integration(function() {
        describe('Vanguard Ace\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanguard-ace', 'daring-raid', 'battlefield-marine', 'academy-training', 'frontier-atrt'],
                    },
                    player2: {
                        hand: ['wampa', 'atst']
                    }
                });
            });

            it('gains 1 experience for each other card played by the controller this phase', function () {
                this.player1.clickCard(this.daringRaid);
                this.player1.clickCard(this.p2Base);

                this.player2.clickCard(this.wampa);

                this.player1.clickCard(this.battlefieldMarine);

                this.player2.clickCard(this.atst);

                this.player1.clickCard(this.academyTraining);
                this.player1.clickCard(this.battlefieldMarine);

                this.player2.passAction();

                this.player1.clickCard(this.vanguardAce);
                expect(this.vanguardAce.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience', 'experience', 'experience']);
            });

            it('gains no experience if no other cards have been played', function () {
                this.player1.clickCard(this.vanguardAce);
                expect(this.vanguardAce.upgrades.length).toBe(0);
            });

            it('does not count cards played in the previous phase', function () {
                this.player1.clickCard(this.daringRaid);
                this.player1.clickCard(this.p2Base);

                this.player2.passAction();

                // TODO: fix this
                this.moveToNextActionPhase();

                this.player1.clickCard(this.battlefieldMarine);

                this.player2.clickCard(this.atst);

                this.player1.clickCard(this.vanguardAce);
                expect(this.vanguardAce.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience']);
            });

            // TODO TAKE CONTROL: check that state watchers still work if the card is played by the opponent
        });
    });
});
