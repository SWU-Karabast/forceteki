describe('Rival\'s Fall', function() {
    integration(function() {
        describe('Rival\'s Fall\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid'],
                    },
                    player2: {}
                });
            });

            it('should heal your base', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.smugglersAid);
                expect(this.p1Base.damage).toBe(2);
            });
        });
    });
});
