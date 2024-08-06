describe('Desperate Negotiator', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['desperate-negotiator']
                },
                player2:{
                    inPlay: ['desperate-negotiator']
                }
            });

            this.negotiator = this.player1.findCardByName('desperate-negotiator');
            this.negotiator2 = this.player2.findCardByName('desperate-negotiator');
            this.negotiator2.fate = 1;

        });


        it('should get +2/+2 when dire', function() {
            expect(this.negotiator.getMilitarySkill()).toBe(this.negotiator.printedMilitarySkill + 2);
            expect(this.negotiator.getPoliticalSkill()).toBe(this.negotiator.printedPoliticalSkill + 2);
        });

        it('should not get +2/+2 when dire', function() {
            expect(this.negotiator2.fate).toBe(1);
            this.game.checkGameState(true);
            expect(this.negotiator2.getMilitarySkill()).toBe(this.negotiator2.printedMilitarySkill);
            expect(this.negotiator2.getPoliticalSkill()).toBe(this.negotiator.printedPoliticalSkill);
        });

    });
});
