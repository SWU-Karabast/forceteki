describe('Vanguard Ace', function() {
    integration(function() {
        describe('Vanguard Ace\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanguard-ace', 'daring-raid', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['wampa', 'atst']
                    }
                });
            });

            it('gains 1 experience for each card played by the controller this phase', function () {
                this.player1.clickCard(this.daringRaid);
                this.player1.clickCard(this.p2Base);

                this.player2.clickCard(this.wampa);

                this.player1.clickCard(this.battlefieldMarine);

                this.player2.clickCard(this.atst);

                this.player1.clickCard(this.vanguardAce);
                expect(this.vanguardAce.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience', 'experience']);
            });

            // TODO TAKE CONTROL: check that state watchers still work if the card is played by the opponent
        });
    });
});
