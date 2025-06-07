describe('Heirloom Lightsaber', function() {
    integration(function(contextRef) {
        describe('Heirloom Lightsaber\'s ability', function() {
            it('can attach to a non-Vehicle unit and gives Restore 1 to Force units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['heirloom-lightsaber'],
                        groundArena: ['battlefield-marine', 'luke-skywalker#a-heros-beginning'],
                        spaceArena: ['tie-fighter'],
                        base: { card: 'administrators-tower', damage: 10 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // Play the upgrade
                context.player1.clickCard(context.heirloomLightsaber);

                // Should be able to select exactly these non-Vehicle units, but not the TIE fighter
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.lukeSkywalkerAHerosBeginning,
                    context.wampa
                ]);

                // Verify the Vehicle unit cannot be targeted
                expect(context.player1).not.toBeAbleToSelect(context.tieFighter);

                // Attach to Luke (who is a Force unit)
                context.player1.clickCard(context.lukeSkywalkerAHerosBeginning);

                // Verify attachment worked
                expect(context.lukeSkywalkerAHerosBeginning.upgrades).toContain(context.heirloomLightsaber);

                // Verify Luke now has Restore 1
                expect(context.lukeSkywalkerAHerosBeginning.hasSomeKeyword('restore')).toBeTrue();

                context.player2.passAction();

                // Luke attacks the Wampa
                context.player1.clickCard(context.lukeSkywalkerAHerosBeginning);
                context.player1.clickCard(context.wampa);

                // Check that the base has healed 1 damage from the Restore 1 effect
                expect(context.player1.base.damage).toBe(9);
            });

            it('does not give Restore to non-Force units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['heirloom-lightsaber'],
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                // Play the upgrade
                context.player1.clickCard(context.heirloomLightsaber);

                // Attach to Battlefield Marine (non-Force unit)
                context.player1.clickCard(context.battlefieldMarine);

                // Verify attachment worked
                expect(context.battlefieldMarine.upgrades).toContain(context.heirloomLightsaber);

                // Verify Battlefield Marine does NOT have Restore keyword
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeFalse();

                // Should be exactly 5 power and 5 HP (assuming base of 3/3 and +2/+2)
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
            });
        });
    });
});
