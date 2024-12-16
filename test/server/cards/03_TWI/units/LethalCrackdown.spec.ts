describe('Lethal Crackdown', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['lethal-crackdown', 'academy-training'],
                        groundArena: ['duchesss-champion', 'grogu#irresistible'],
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true }
                    },
                    player2: {
                        hand: ['lethal-crackdown'],
                        groundArena: ['specforce-soldier'],
                    },
                });
            });

            it('should defeat the unit and damage the base', function () {
                const { context } = contextRef;
                const duchesssPowerWithUpgrade = context.duchesssChampion.getPower() + context.academyTraining.getPower();
                const lethalCrackdownP1 = context.player1.findCardByName('lethal-crackdown');
                const lethalCrackdownP2 = context.player2.findCardByName('lethal-crackdown');


                // Applying the upgrade to the unit
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.duchesssChampion);

                // Checking if the deployed leader cannot be targeted
                context.player2.clickCard(lethalCrackdownP2);
                expect(context.player2).toBeAbleToSelectExactly([context.duchesssChampion, context.specforceSoldier, context.grogu]);
                context.player2.clickCard(context.grogu);
                expect(context.grogu).toBeInZone('discard');

                // Checking if targeting unit with 0 power does not cause an error
                expect(context.p2Base.damage).toBe(0);

                // Checking if the upgrade power is applied in the damage calculation to the base
                context.player1.clickCard(lethalCrackdownP1);
                context.player1.clickCard(context.duchesssChampion);
                expect(context.duchesssChampion).toBeInZone('discard');
                expect(context.player1.base.damage).toBe(duchesssPowerWithUpgrade);
            });

            it('should defeat enemy unit and damage the base', function () {
                const { context } = contextRef;
                const lethalCrackdownP1 = context.player1.findCardByName('lethal-crackdown');

                // Checking if enemy unit can be targeted and apply damage to our base
                context.player1.clickCard(lethalCrackdownP1);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.player1.base.damage).toBe(2);
            });
        });
    });
});