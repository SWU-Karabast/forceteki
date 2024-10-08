describe('General Veers, Blizzard Force Commander', function() {
    integration(function() {
        describe('General Veers\' ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-veers#blizzard-force-commander', 'viper-probe-droid', 'death-star-stormtrooper', 'wampa'],
                        spaceArena: ['tie-advanced'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    },
                    player2: {
                        groundArena: ['death-trooper'],
                        spaceArena: ['relentless#konstantines-folly']
                    }
                });
            });

            it('should give +1/+1 to all other friendly Imperial units', function () {
                // Do not buff self
                expect(this.generalVeers.getPower()).toBe(3);
                expect(this.generalVeers.getHp()).toBe(3);

                // Buff other friendly units
                expect(this.viperProbeDroid.getPower()).toBe(4);
                expect(this.viperProbeDroid.getHp()).toBe(3);

                expect(this.deathStarStormtrooper.getPower()).toBe(4);
                expect(this.deathStarStormtrooper.getHp()).toBe(2);

                // Do not buff non-imperial
                expect(this.wampa.getPower()).toBe(4);
                expect(this.wampa.getHp()).toBe(5);

                // Buff friendly leaders
                expect(this.grandMoffTarkin.getPower()).toBe(3);
                expect(this.grandMoffTarkin.getHp()).toBe(8);

                // Buff friendly space units
                expect(this.tieAdvanced.getPower()).toBe(4);
                expect(this.tieAdvanced.getHp()).toBe(3);

                // Do not buff enemy units
                expect(this.deathTrooper.getPower()).toBe(3);
                expect(this.deathTrooper.getHp()).toBe(3);

                expect(this.relentless.getPower()).toBe(8);
                expect(this.relentless.getHp()).toBe(8);

                // Correctly apply buffs to attacks
                this.player1.clickCard(this.tieAdvanced);
                this.player1.clickCard(this.relentless);
                expect(this.tieAdvanced).toBeInLocation('discard');
                expect(this.relentless.damage).toBe(4);
            });
        });
    });
});

