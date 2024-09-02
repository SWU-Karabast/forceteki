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
            });

            it('should exhaust the defender on attack', function () {
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.snowspeeder);

                expect(this.snowspeeder.damage).toBe(5);
                expect(this.battlefieldMarine.damage).toBe(3);
                expect(this.snowspeeder.exhausted).toBe(true);
            });

            it('should not have any effect after being removed', function () {
                this.vambraceGrappleshot.unattach();
                this.player1.moveCard(this.vambraceGrappleshot, 'discard');

                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.snowspeeder);

                expect(this.snowspeeder.damage).toBe(3);
                expect(this.battlefieldMarine).toBeInLocation('discard');
                expect(this.snowspeeder.exhausted).toBe(false);
            });
        });

        describe('Vambrace Grappleshot', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vambrace-grappleshot'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },
                    player2: {
                    }
                });

                this.vambraceGrappleshot = this.player1.findCardByName('vambrace-grappleshot');
                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');
                this.snowspeeder = this.player1.findCardByName('snowspeeder');
            });

            it('should not be playable on vehicles', function () {
                this.player1.clickCard(this.vambraceGrappleshot);
                expect(this.battlefieldMarine.upgrades).toContain(this.vambraceGrappleshot);
            });
        });
    });
});
