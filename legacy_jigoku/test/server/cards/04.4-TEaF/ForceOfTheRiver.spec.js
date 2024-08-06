describe('Force of the River', function() {
    integration(function() {
        describe('Force of the River\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 1,
                        inPlay: ['doomed-shugenja'],
                        hand: ['force-of-the-river', 'seal-of-the-unicorn'],
                        dynastyDiscard: ['hida-kisada', 'doji-kuwanan', 'imperial-storehouse', 'bayushi-liar'],
                        provinces: ['manicured-garden']
                    },
                    player2: {
                        inPlay: []
                    }
                });

                this.doomed = this.player1.findCardByName('doomed-shugenja');
                this.river = this.player1.findCardByName('force-of-the-river');
                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.liar = this.player1.findCardByName('bayushi-liar');
                this.storehouse = this.player1.findCardByName('imperial-storehouse');

                this.player1.playAttachment(this.river, this.doomed);
                this.garden = this.player1.findCardByName('manicured-garden');

                this.player1.moveCard(this.kuwanan, this.garden.location);
                this.player1.moveCard(this.storehouse, this.garden.location);
                this.player1.moveCard(this.kisada, this.garden.location);
                this.player1.moveCard(this.liar, this.garden.location);

                this.kuwanan.facedown = false;
                this.kisada.facedown = true;
                this.storehouse.facedown = true;
                this.liar.facedown = true;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.doomed],
                    defenders: [],
                    type: 'military'
                });
            });

            it('should put all facedown cards in a province into play as a spirit of the river', function() {
                this.player2.pass();
                this.player1.clickCard(this.river);

                expect(this.kisada.location).toBe('removed from game');
                expect(this.kisada.facedown).toBe(true);

                expect(this.storehouse.location).toBe('removed from game');
                expect(this.storehouse.facedown).toBe(true);

                expect(this.liar.location).toBe('removed from game');
                expect(this.liar.facedown).toBe(true);

                let attackersValid = this.game.currentConflict.attackers.length >= 4;

                expect(attackersValid).toBe(true);
            });
        });
    });
});
