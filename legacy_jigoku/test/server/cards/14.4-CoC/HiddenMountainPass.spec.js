describe('Hidden Mountain Pass', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    dynastyDiscard: ['hidden-mountain-pass'],
                    provinces: ['manicured-garden','shameful-display']
                },
                player2: {
                    provinces: ['fertile-fields']
                }
            });

            this.mountainPass = this.player1.placeCardInProvince('hidden-mountain-pass', 'province 1');

            this.manicured = this.player1.findCardByName('manicured-garden');
            this.fertile = this.player2.findCardByName('fertile-fields');
            this.shameful = this.player1.findCardByName('shameful-display');

            this.shameful.facedown = false;
            this.manicured.facedown = false;
            this.fertile.facedown = false;

            this.player1.moveCard(this.mountainPass, this.shameful.location);
            this.noMoreActions();

            this.noMoreActions();

            this.noMoreActions();

            this.noMoreActions();

            //end of phase after next passes
        });

        it('should trigger at the end of the conflict phase', function() {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.mountainPass);
        });

        it('should flip the province facedown', function() {
            expect(this.shameful.facedown).toBe(false);
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.mountainPass);
            expect(this.shameful.facedown).toBe(true);
        });

        it('should not trigger if the province is already facedown', function() {
            this.shameful.facedown = true;
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Discard Dynasty Cards');
        });

        it('should only be able to affect the province it is on', function() {
            expect(this.manicured.facedown).toBe(false);
            expect(this.fertile.facedown).toBe(false);
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.mountainPass);
            expect(this.manicured.facedown).toBe(false);
            expect(this.fertile.facedown).toBe(false);
        });

        it('should not affect a broken province', function() {
            this.shameful.isBroken = true;
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.mountainPass);
            expect(this.shameful.isBroken).toBe(true);
            expect(this.shameful.facedown).toBe(false);
        });
    });
});
