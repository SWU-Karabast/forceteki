describe('Grand Moff Tarkin, Oversector Governor', function() {
    integration(function() {
        describe('Tarkin\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give a friendly imperial unit an experience token', function () {
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickPrompt('Give an experience token to an Imperial unit');
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);

                this.player1.clickCard(this.atst);
                expect(this.grandMoffTarkin.exhausted).toBe(true);
                expect(this.atst.upgrades.length).toBe(1);
                expect(this.atst.upgrades[0].internalName).toBe('experience');
            });

            it('should deploy and have the on attack ability', function () {
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickPrompt('Deploy Grand Moff Tarkin');

                this.player2.passAction();

                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickCard(this.wampa);

                expect(this.player1).toHavePrompt('Choose a card');
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);
                this.player1.clickCard(this.tielnFighter);

                expect(this.tielnFighter.upgrades.length).toBe(1);
                expect(this.tielnFighter.upgrades[0].internalName).toBe('experience');
                expect(this.grandMoffTarkin.damage).toBe(4);
                expect(this.wampa.damage).toBe(2);
            });
        });
    });
});
