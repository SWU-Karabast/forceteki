describe('Garanto Guardian', function() {
    integration(function() {
        describe('Garanto Guardian\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['tattooed-wanderer'],
                        hand: ['seeker-of-knowledge', 'fine-katana', 'charge']
                    },
                    player2: {
                        provinces: ['pilgrimage', 'toshi-ranbo', 'manicured-garden'],
                        inPlay: ['garanto-guardian']
                    }
                });

                this.guardian = this.player2.findCardByName('garanto-guardian');
                this.wanderer = this.player1.findCardByName('tattooed-wanderer');
                this.noMoreActions();
            });

            it('should trigger after you win as defender', function() {
                this.initiateConflict({
                    province: 'manicured-garden',
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.guardian]
                });
                this.noMoreActions();
                expect(this.player2).toHavePrompt('Any Reactions?');
                expect(this.player2).toBeAbleToSelect(this.guardian);
            });

            it('should let you choose and resolve the air ring', function() {
                let startingHonor = this.player2.honor;
                this.initiateConflict({
                    province: 'manicured-garden',
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.guardian]
                });
                this.noMoreActions();
                this.player2.clickCard(this.guardian);
                expect(this.player2).toBeAbleToSelectRing('air');
                expect(this.player2).not.toBeAbleToSelectRing('earth');
                this.player2.clickRing('air');
                expect(this.player2).toHavePrompt('Air ring');
                this.player2.clickPrompt('Gain 2 honor');
                expect(this.player2.honor).toBe(startingHonor + 2);
            });

            it('should let you choose any element for toshi ranbo', function() {
                this.initiateConflict({
                    province: 'toshi-ranbo',
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.guardian]
                });
                this.noMoreActions();
                this.player2.clickCard(this.guardian);
                expect(this.player2).toBeAbleToSelectRing('air');
                expect(this.player2).toBeAbleToSelectRing('earth');
                expect(this.player2).toBeAbleToSelectRing('void');
                expect(this.player2).toBeAbleToSelectRing('fire');
                expect(this.player2).toBeAbleToSelectRing('water');
            });

            it('should let you choose the ring even if it is claimed', function() {
                this.player1.claimRing('air');
                this.initiateConflict({
                    province: 'manicured-garden',
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wanderer],
                    defenders: [this.guardian]
                });
                this.noMoreActions();
                this.player2.clickCard(this.guardian);
                expect(this.player2).toBeAbleToSelectRing('air');
                this.player2.clickRing('air');
                expect(this.player2).toHavePrompt('Air ring');
            });
        });
    });
});
