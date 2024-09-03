describe('Leader cards', function() {
    integration(function() {
        describe('Uneployed leaders', function() {
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

            it('should not be able to deploy if there are too few resources', function () {
                this.player1.setResourceCount(3);

                this.player1.clickCard(this.grandMoffTarkin);
                expect(this.player1).not.toHaveEnabledPromptButton('Deploy Grand Moff Tarkin');

                // resolve the Tarkin ability and click him again to make sure he presents no options
                this.player1.clickCard(this.atst);
                this.player2.passAction();
                expect(this.grandMoffTarkin).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);

                // move to next action phase to confirm that Tarkin is readied
                this.moveToNextActionPhase();
                expect(this.grandMoffTarkin.exhausted).toBe(false);
            });

            // it('should deploy and have the on attack ability', function () {
            //     this.player1.clickCard(this.grandMoffTarkin);
            //     this.player1.clickPrompt('Deploy Grand Moff Tarkin');

            //     this.player2.passAction();

            //     this.player1.clickCard(this.grandMoffTarkin);
            //     this.player1.clickCard(this.wampa);

            //     expect(this.player1).toHavePrompt('Choose a card');
            //     expect(this.player1).toHaveEnabledPromptButton('Pass ability');
            //     expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);
            //     this.player1.clickCard(this.tielnFighter);

            //     expect(this.tielnFighter.upgrades.length).toBe(1);
            //     expect(this.tielnFighter.upgrades[0].internalName).toBe('experience');
            //     expect(this.grandMoffTarkin.damage).toBe(4);
            //     expect(this.wampa.damage).toBe(2);
            // });
        });
    });
});
