describe('Guardian of the Whills', function () {
    integration(function (contextRef) {
        describe('Guardian of the Whills\' ability', function () {
            it('should decrease the cost of the first upgrade played on it by 1 resource, once per round', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['resilient', 'devotion', 'electrostaff', 'foundling', 'entrenched', 'jedi-lightsaber'],
                        groundArena: ['guardian-of-the-whills'],
                        leader: 'chewbacca#walking-carpet', // vigilance aspect
                    },
                    player2: {
                        hand: ['waylay'],
                        spaceArena: ['system-patrol-craft'],
                        leader: 'chewbacca#walking-carpet', // vigilance aspect
                    }
                });

                const { context } = contextRef;

                // The first upgrade put on the whills should be 1 cheaper
                context.player1.clickCard(context.resilient);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills.upgrades).toContain(context.resilient);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // Any further upgrades are full price
                context.player1.clickCard(context.devotion);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills.upgrades).toContain(context.devotion);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // Test round ending resets limit
                context.moveToNextActionPhase();
                context.player1.clickCard(context.electrostaff);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills.upgrades).toContain(context.electrostaff);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Test this doesn't accidentally decrease the cost playing on non-Whills units
                context.moveToNextActionPhase();
                context.player1.clickCard(context.foundling);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.systemPatrolCraft]);
                context.player1.clickCard(context.systemPatrolCraft);
                expect(context.systemPatrolCraft.upgrades).toContain(context.foundling);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Sennd Whills back to hand to test the 'copy of a unit' logic
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.guardianOfTheWhills);
                expect(context.resilient).toBeInZone('discard');
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
                expect(context.guardianOfTheWhills.upgrades).toContain(context.entrenched);
                expect(context.guardianOfTheWhills.upgrades.length).toBe(1);

                context.player2.passAction();

                // Reconfirm  further upgrades are full price on this new copy
                context.player1.clickCard(context.jediLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills]);
                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills.upgrades).toContain(context.jediLightsaber);
                expect(context.player1.exhaustedResourceCount).toBe(7); // +3 for light saber
            });
        });
    });
});
