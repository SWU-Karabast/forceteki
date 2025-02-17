
describe('Rose Tico, Saving What We Love', function() {
    integration(function(contextRef) {
        describe('Rose Tico, Saving What We Love\'s undeployed ability', function() {
            it('should heal a Vehicle unit that attacked this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'alliance-xwing', damage: 2 }],
                        groundArena: [{ card: 'wampa', damage: 2 }, 'low-altitude-gunship'],
                        leader: 'rose-tico#saving-what-we-love'
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: [{ card: 'atst', damage: 3 }, 'republic-tactical-officer'],
                    }
                });

                const { context } = contextRef;

                // Attack with a Vehicle unit
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);

                // Opponent attacked with a Vehicle unit
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                // Heal the Vehicle unit
                context.player1.clickCard(context.roseTico);
                context.player1.clickPrompt('Heal 2 damage from a Vehicle unit that attacked this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.atst]); // Only the Vehicle units that attacked this phase
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.roseTico.exhausted).toBe(true);

                // Move to next action phase
                context.moveToNextActionPhase();
                context.player1.clickCard(context.lowAltitudeGunship); // Attack with a Vehicle unit
                context.player1.clickCard(context.p2Base);

                // Opponent waylays the Vehicle unit
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.lowAltitudeGunship);

                context.player1.clickCard(context.lowAltitudeGunship);
                context.player1.clickCard(context.republicTacticalOfficer); // Resolving Low Altitude Gunship's ability

                context.player2.passAction();
                context.player1.clickCard(context.roseTico);
                context.player1.clickPrompt('Heal 2 damage from a Vehicle unit that attacked this phase');
                expect(context.player2).toBeActivePlayer();

                // Move to next action phase
                context.moveToNextActionPhase();
                context.player1.clickCard(context.roseTico);
                context.player1.clickPrompt('Heal 2 damage from a Vehicle unit that attacked this phase');

                // No Vehicle units attacked this phase so not able to heal
                expect(context.player2).toBeActivePlayer();
                expect(context.roseTico.exhausted).toBe(true);
            });
        });

        describe('Rose Tico, Saving What We Love\'s deployed ability', function() {
            it('should heal a Vehicle unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'alliance-xwing', damage: 2 }],
                        groundArena: ['wampa', { card: 'low-altitude-gunship', damage: 3 }],
                        leader: { card: 'rose-tico#saving-what-we-love', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst', { card: 'republic-tactical-officer', damage: 2 }],
                    }
                });

                const { context } = contextRef;

                // Heal a Vehicle unit
                context.player1.clickCard(context.roseTico);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.lowAltitudeGunship, context.atst]); // Only the Vehicle units
                context.player1.clickCard(context.lowAltitudeGunship);

                expect(context.lowAltitudeGunship.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});