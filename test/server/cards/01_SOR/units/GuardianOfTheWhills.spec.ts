describe('Guardian of the Whills', function () {
    integration(function (contextRef) {
        describe('Guardian of the Whills\' ability', function () {
            it('should decrease the cost of the first upgrade played on it by 1 resource, once per round', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['jetpack', 'devotion', 'electrostaff', 'foundling', 'entrenched', 'jedi-lightsaber', 'mandalorian-armor',
                            'vambrace-grappleshot', 'survivors-gauntlet', 'moisture-farmer', 'protector', 'razor-crest#reliable-gunship'],
                        groundArena: ['guardian-of-the-whills'],
                        leader: 'chewbacca#walking-carpet', // vigilance aspect
                        base: 'chopper-base'
                    },
                    player2: {
                        hand: ['waylay', 'confiscate'],
                        spaceArena: ['system-patrol-craft'],
                        leader: 'chewbacca#walking-carpet', // vigilance aspect
                    }
                });

                const { context } = contextRef;

                // The first upgrade put on the whills should be 1 cheaper
                context.player1.clickCard(context.jetpack);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.jetpack.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // Any further upgrades are full price
                context.player1.clickCard(context.devotion);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.jetpack.internalName, context.devotion.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                // Test round ending resets limit
                context.moveToNextActionPhase();
                context.player1.clickCard(context.electrostaff);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.jetpack.internalName, context.devotion.internalName, context.electrostaff.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Test this doesn't accidentally decrease the cost playing on non-Whills units
                context.moveToNextActionPhase();
                context.player1.clickCard(context.foundling);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.systemPatrolCraft);
                expect(context.systemPatrolCraft).toHaveExactUpgradeNames([context.foundling.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Sennd Whills back to hand to test the 'copy of a unit' logic
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.guardianOfTheWhills);
                expect(context.jetpack).toBeInZone('discard');
                expect(context.devotion).toBeInZone('discard');
                expect(context.electrostaff).toBeInZone('discard');

                // Replay the whills card to create a new copy
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();

                // The first upgrade should be cheaper again after a newly played whills as its a new copy
                context.player1.clickCard(context.entrenched);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.player1.exhaustedResourceCount).toBe(4); // entrenched only costs 1
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.entrenched.internalName]);

                context.player2.passAction();

                // Reconfirm  further upgrades are full price on this new copy
                context.player1.clickCard(context.jediLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.entrenched.internalName, context.jediLightsaber.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(7); // +3 for light saber

                // Now lets try transfering an upgrade to ensure it works correctly
                context.moveToNextActionPhase();
                context.player1.clickCard(context.mandalorianArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.entrenched.internalName, context.jediLightsaber.internalName, context.mandalorianArmor.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(1); // 1 less for the whills bonus

                context.player2.passAction();

                // Put out another unit to move an upgrade to
                context.player1.clickCard(context.moistureFarmer);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.jediLightsaber, context.mandalorianArmor, context.foundling]);
                context.player1.clickCard(context.mandalorianArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer]);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.entrenched.internalName, context.jediLightsaber.internalName]);
                expect(context.moistureFarmer).toHaveExactUpgradeNames([context.mandalorianArmor.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(7);

                context.player2.passAction();

                context.player1.clickCard(context.vambraceGrappleshot);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.moistureFarmer]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames([context.entrenched.internalName, context.jediLightsaber.internalName, context.vambraceGrappleshot.internalName]);
                expect(context.player1.exhaustedResourceCount).toBe(9); // shouldn't get a bonus (despite parent card changing for mandalorian armor)

                // Test having an upgrade get removed and added back tracks correctly
                context.moveToNextActionPhase();
                context.player1.clickCard(context.protector);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.moistureFarmer, context.systemPatrolCraft, context.survivorsGauntlet]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.player1.exhaustedResourceCount).toBe(2); // full cost is 3 given the double aspect, so 2 with discount

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.protector);
                expect(context.protector).toBeInZone('discard');

                context.player1.clickCard(context.razorCrestReliableGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.jetpack, context.devotion, context.electrostaff, context.protector]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.protector);
                expect(context.player1.exhaustedResourceCount).toBe(6); 

                context.player2.passAction();

                context.player1.clickCard(context.protector);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.moistureFarmer, context.systemPatrolCraft, context.survivorsGauntlet, context.razorCrestReliableGunship]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.player1.exhaustedResourceCount).toBe(9); // full cost is 3
            });
        });
    });
});
