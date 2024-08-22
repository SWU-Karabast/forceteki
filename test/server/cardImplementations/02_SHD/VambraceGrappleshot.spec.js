describe('Vambrace Grappleshot', function() {
    integration(function() {
        describe('Vambrace Grappleshot\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['vambrace-grappleshot'] }],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });

                this.vambraceGrappleshot = this.player1.findCardByName('vambrace-grappleshot');
                this.marine = this.player1.findCardByName('battlefield-marine');
                this.snowspeeder = this.player2.findCardByName('snowspeeder');

                this.noMoreActions();
            });

            it('should exhaust the defender on attack', function () {
                this.player1.clickCard(this.marine);
                this.player1.clickCard(this.snowspeeder);

                expect(this.snowspeeder.damage).toBe(5);
                expect(this.marine.damage).toBe(3);
                expect(this.snowspeeder.exhausted).toBe(true);
            });
        });
    });
});
