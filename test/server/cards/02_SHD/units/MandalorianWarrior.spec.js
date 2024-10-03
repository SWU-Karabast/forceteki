describe('Mandalorian Warrior', function () {
    integration(function () {
        describe('Mandalorian Warrior\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mandalorian-warrior'],
                        groundArena: ['protector-of-the-throne', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });
            });

            it('should give experience to mandalorian unit', function () {
                // add experience to a mandalorian
                this.player1.clickCard(this.mandalorianWarrior);
                this.player1.clickPrompt('Give 1 experience to another Mandalorian unit')
                expect(this.protectorOfTheThrone.isUpgraded()).toBeTrue();
            });
        });
    });
});
