describe('General Veers, Blizzard Force Commander', function() {
    integration(function(contextRef) {
        describe('General Veers\' ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                // Do not buff self
                expect(context.generalVeers.getPower()).toBe(3);
                expect(context.generalVeers.getHp()).toBe(3);

                // Buff other friendly units
                expect(context.viperProbeDroid.getPower()).toBe(4);
                expect(context.viperProbeDroid.getHp()).toBe(3);

                expect(context.deathStarStormtrooper.getPower()).toBe(4);
                expect(context.deathStarStormtrooper.getHp()).toBe(2);

                // Do not buff non-imperial
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // Buff friendly leaders
                expect(context.grandMoffTarkin.getPower()).toBe(3);
                expect(context.grandMoffTarkin.getHp()).toBe(8);

                // Buff friendly space units
                expect(context.tieAdvanced.getPower()).toBe(4);
                expect(context.tieAdvanced.getHp()).toBe(3);

                // Do not buff enemy units
                expect(context.deathTrooper.getPower()).toBe(3);
                expect(context.deathTrooper.getHp()).toBe(3);

                expect(context.relentless.getPower()).toBe(8);
                expect(context.relentless.getHp()).toBe(8);

                // Correctly apply buffs to attacks
                context.player1.clickCard(context.tieAdvanced);
                context.player1.clickCard(context.relentless);
                expect(context.tieAdvanced).toBeInLocation('discard');
                expect(context.relentless.damage).toBe(4);
            });
        });
    });
});

