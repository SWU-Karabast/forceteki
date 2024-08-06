describe('Resourcefulness', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'bayushi-manipulator'],
                    hand: ['resourcefulness']
                },
                player2: {
                    inPlay: ['yogo-hiroue']
                }
            });

            this.liar = this.player1.findCardByName('bayushi-liar');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.yogoHiroue = this.player2.findCardByName('yogo-hiroue');
            this.resource = this.player1.findCardByName('resourcefulness');
        });

        it('should dishonor someone you control to honor someone', function () {
            this.player1.clickCard(this.resource);
            expect(this.player1).toHavePrompt('Choose a character to honor');
            expect(this.player1).toBeAbleToSelect(this.liar);
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).toBeAbleToSelect(this.yogoHiroue);
            this.player1.clickCard(this.manipulator);

            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.liar);
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.yogoHiroue);

            this.player1.clickCard(this.liar);
            expect(this.manipulator.isHonored).toBe(true);
            expect(this.liar.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Resourcefulness, dishonoring Bayushi Liar to honor Bayushi Manipulator');
        });
    });
});
