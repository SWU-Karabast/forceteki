describe('Open window', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shadow-stalker', 'tranquil-philosopher', 'young-harrier'],
                    dynastyDiscard: ['open-window']
                },
                player2: {
                    inPlay: ['shadow-stalker', 'mirumoto-raitsugu']
                }
            });

            this.harrier = this.player1.findCardByName('young-harrier');
            this.stalker1 = this.player1.findCardByName('shadow-stalker');
            this.stalker2 = this.player2.findCardByName('shadow-stalker');
            this.philosopher = this.player1.findCardByName('tranquil-philosopher');
            this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.window = this.player1.placeCardInProvince('open-window', 'province 1');

            this.noMoreActions();
            this.initiateConflict({
                attackers: ['young-harrier'],
                defenders: []
            });
        });

        it('should allow targeting a shinobi you control at home', function() {
            this.player2.pass();
            this.player1.clickCard(this.window);
            expect(this.player1).toBeAbleToSelect(this.stalker1);
            expect(this.player1).not.toBeAbleToSelect(this.stalker2);
            expect(this.player1).not.toBeAbleToSelect(this.philosopher);
            expect(this.player1).not.toBeAbleToSelect(this.raitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.harrier);
        });


        it('should move the chosen shinobi into the conflict', function() {
            expect(this.game.currentConflict.attackers).not.toContain(this.stalker1);
            this.player2.pass();
            this.player1.clickCard(this.window);
            this.player1.clickCard(this.stalker1);
            expect(this.game.currentConflict.attackers).toContain(this.stalker1);
        });
    });
});
