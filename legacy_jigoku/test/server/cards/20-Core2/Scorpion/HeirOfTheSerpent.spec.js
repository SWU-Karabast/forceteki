describe('Heir of the Serpent', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['heir-of-the-serpent', 'bayushi-manipulator']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });

            this.heirOfTheSerpent = this.player1.findCardByName('heir-of-the-serpent');
            this.bayushiManipulator = this.player1.findCardByName('bayushi-manipulator');
            this.dojiChallenger = this.player2.findCardByName('doji-challenger');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.heirOfTheSerpent],
                defenders: [this.dojiChallenger]
            });
            this.player2.pass();
            this.player1.clickCard(this.heirOfTheSerpent);
        });

        it('should prompt to select a character', function () {
            expect(this.player1).toHavePrompt('Choose a character');
        });

        it('should only target a unit you control', function () {
            expect(this.player1).toBeAbleToSelect(this.heirOfTheSerpent);
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).not.toBeAbleToSelect(this.dojiChallenger);
        });

        it('when target is participating, move it home', function () {
            this.player1.clickCard(this.heirOfTheSerpent);
            expect(this.heirOfTheSerpent.inConflict).toBe(false);
            expect(this.game.currentConflict.attackers).not.toContain(this.heirOfTheSerpent);
        });

        it('when target is home, move it to the conflict', function () {
            this.player1.clickCard(this.bayushiManipulator);
            expect(this.bayushiManipulator.inConflict).toBe(true);
            expect(this.game.currentConflict.attackers).toContain(this.bayushiManipulator);
        });
    });
});
