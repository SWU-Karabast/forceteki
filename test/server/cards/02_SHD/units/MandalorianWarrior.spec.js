describe('Mandalorian Warrior', function () {
    integration(function () {
        describe('Mandalorian Warrior\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mandalorian-warrior'],
                        groundArena: ['protector-of-the-throne', 'battlefield-marine'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },
                    player2: {
                        groundArena: ['snowspeeder', 'clan-challengers']
                    }
                });
            });

            it('should give an experience to mandalorian unit', function () {
                this.player1.clickCard(this.mandalorianWarrior);
                expect(this.player1).toBeAbleToSelectExactly([this.protectorOfTheThrone, this.sabineWren, this.clanChallengers]);
                this.player1.clickCard(this.protectorOfTheThrone);
                expect(this.protectorOfTheThrone.isUpgraded()).toBeTrue();
            });
        });
    });
});
