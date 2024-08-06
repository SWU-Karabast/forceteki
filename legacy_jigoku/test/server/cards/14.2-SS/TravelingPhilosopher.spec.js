describe('Traveling Philosopher', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['traveling-philosopher'],
                    dynastyDiscard: ['togashi-ichi'],
                    provinces: ['manicured-garden']
                },
                player2: {
                    provinces: ['fertile-fields']
                }
            });

            this.manicured = this.player1.findCardByName('manicured-garden');
            this.travelingPhilosopher = this.player1.findCardByName('traveling-philosopher');
            this.ichi = this.player1.placeCardInProvince('togashi-ichi', 'province 1');

            this.fertile = this.player2.findCardByName('fertile-fields');
        });

        it('should not be able to trigger with no faceup provinces', function() {
            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.travelingPhilosopher);
            expect(this.player1).not.toHavePrompt('Traveling philosopher');
            expect(this.travelingPhilosopher.location).toBe('dynasty discard pile');
        });

        it('should only be able to target your own provinces', function() {
            this.manicured.facedown = false;
            this.fertile.facedown = false;

            this.game.checkGameState(true);
            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.travelingPhilosopher);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.travelingPhilosopher);
            expect(this.player1).toHavePrompt('Traveling philosopher');

            expect(this.player1).toBeAbleToSelect(this.manicured);
            expect(this.player1).not.toBeAbleToSelect(this.fertile);
            this.player1.clickCard(this.manicured);
            expect(this.travelingPhilosopher.location).toBe('dynasty discard pile');
            expect(this.manicured.facedown).toBe(true);
        });
    });
});
