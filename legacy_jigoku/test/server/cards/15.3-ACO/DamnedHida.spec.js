describe('Damned Hida', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['damned-hida']
                },
                player2:{
                    inPlay: ['damned-hida']
                }
            });

            this.hida = this.player1.findCardByName('damned-hida');
            this.hida2 = this.player2.findCardByName('damned-hida');
            this.hida2.fate = 1;

        });


        it('should get +3 military skill when dire', function() {
            expect(this.hida.getMilitarySkill()).toBe(this.hida.printedMilitarySkill + 3);
        });

        it('should not get +3 military skill when dire', function() {
            expect(this.hida2.fate).toBe(1);
            this.game.checkGameState(true);
            expect(this.hida2.getMilitarySkill()).toBe(this.hida2.printedMilitarySkill);
        });

    });
});
