describe('Corrupted', function() {
    integration(function() {
        describe('Dynasty Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: ['exiled-guardian'],
                        provinces: ['tsuma', 'shinsei-s-last-hope', 'manicured-garden']
                    },
                    player2: {
                    }
                });

                this.guardian = this.player1.findCardByName('exiled-guardian');
                this.tsuma = this.player1.findCardByName('tsuma');
                this.slh = this.player1.findCardByName('shinsei-s-last-hope');
                this.garden = this.player1.findCardByName('manicured-garden');
            });

            it('should enter play tainted - Tsuma', function() {
                this.player1.placeCardInProvince(this.guardian, this.tsuma.location);
                this.player1.clickCard(this.guardian);
                this.player1.clickPrompt('0');

                expect(this.guardian.isHonored).toBe(true);
                expect(this.guardian.isTainted).toBe(true);
            });

            it('should enter play tainted - SLH', function() {
                this.player1.placeCardInProvince(this.guardian, this.slh.location);
                this.player1.clickCard(this.guardian);
                this.player1.clickPrompt('0');

                expect(this.guardian.isDishonored).toBe(true);
                expect(this.guardian.isTainted).toBe(true);
            });

            it('should enter play tainted - normal', function() {
                this.player1.placeCardInProvince(this.guardian, this.garden.location);
                this.player1.clickCard(this.guardian);
                this.player1.clickPrompt('0');

                expect(this.guardian.isTainted).toBe(true);
            });
        });

        describe('Conflict Phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['steward-of-law'],
                        dynastyDiscard: ['exiled-guardian'],
                        hand: ['charge']
                    },
                    player2: {
                    }
                });

                this.law = this.player1.findCardByName('steward-of-law');
                this.charge = this.player1.findCardByName('charge');
                this.guardian = this.player1.findCardByName('exiled-guardian');
                this.player1.placeCardInProvince(this.guardian, 'province 1');
            });

            it('should enter play tainted - put into play', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.law],
                    defenders: [],
                    type: 'military'
                });
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.guardian);
                expect(this.guardian.location).toBe('play area');
                expect(this.guardian.isTainted).toBe(true);
            });
        });
    });
});
