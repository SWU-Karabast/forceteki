describe('Lethal Crackdown', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['lethal-crackdown', 'academy-training'],
                        groundArena: ['duchesss-champion']
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                    },
                });
            });

            it('should defeat the unit and damage the base', function () {
                const { context } = contextRef;
                const duchesssPowerWithUpgrade = context.duchesssChampion.getPower() + context.academyTraining.getPower();

                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.duchesssChampion);
                context.player2.passAction();

                // Checking if the upgrade is applied in the damage calculation to the base
                context.player1.clickCard(context.lethalCrackdown);
                context.player1.clickCard(context.duchesssChampion);
                expect(context.player1.base.damage).toBe(duchesssPowerWithUpgrade);
            });

            it('should defeat enemy unit and damage the base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lethalCrackdown);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.player1.base.damage).toBe(2);
            });
        });
        it('should do nothing if there is no unit to defeat', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['lethal-crackdown'],
                },
                player2: {
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.lethalCrackdown);
            expect(context.lethalCrackdown).toBeInZone('discard');
            expect(context.p1Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});