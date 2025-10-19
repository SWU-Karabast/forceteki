describe('Lama Su, We Modified Their Genetics', function() {
    integration(function(contextRef) {
        describe('Lama Su\'s leader side ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training', 'iden-versio#adapt-or-die', 'bolstered-endurance'],
                        leader: 'lama-su#we-modified-their-genetics',
                        base: 'echo-base',
                        groundArena: ['wampa', 'gungi#finding-himself'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['maul#shadow-collective-visionary'],
                    }
                });
            });

            it('should play an upgrade from hand to a friendly non-vehicle unit. It costs 1 resource less and deal 1 damage to the attached unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lamaSu);
                context.player1.clickPrompt('Play an upgrade from your hand on a friendly non-Vehicle unit. It costs 1 resource less. If you do, deal 1 damage to that unit.');

                expect(context.player1).toBeAbleToSelectExactly([context.academyTraining, context.bolsteredEndurance]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.academyTraining);

                // only friendly non-vehicle unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.gungi]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames(['academy-training']);
                expect(context.wampa.damage).toBe(1);
            });

            it('should play an upgrade from hand to a friendly non-vehicle unit and verify attached conditions', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lamaSu);
                context.player1.clickPrompt('Play an upgrade from your hand on a friendly non-Vehicle unit. It costs 1 resource less. If you do, deal 1 damage to that unit.');

                context.player1.clickCard(context.bolsteredEndurance);

                expect(context.player1).toBeAbleToSelectExactly([context.gungi]);
                context.player1.clickCard(context.gungi);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.gungi).toHaveExactUpgradeNames(['bolstered-endurance']);
                expect(context.gungi.damage).toBe(1);
            });
        });

        describe('Lama Su\'s Unit side ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'lama-su#we-modified-their-genetics', deployed: true },
                        base: 'echo-base',
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        discard: ['academy-training', 'iden-versio#adapt-or-die', 'jedi-lightsaber']
                    },
                    player2: {
                        groundArena: ['gungi#finding-himself', 'maul#shadow-collective-visionary'],
                        discard: ['generals-blade']
                    }
                });
            });

            it('can play an upgrade from his discard on a friendly non-vehicle unit (decrease cost by 1 resource) on attack completed', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.lamaSu);
                context.player1.clickCard(context.p2Base);

                // cannot play Iden Versio as Pilot (target cannot bea Vehicle unit)
                expect(context.player1).toBeAbleToSelectExactly([context.academyTraining, context.jediLightsaber]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.academyTraining);

                // only friendly non-vehicle unit
                expect(context.player1).toBeAbleToSelectExactly([context.lamaSu, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames(['academy-training']);
            });

            it('should not trigger as she does not survives', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.lamaSu);
                context.player1.clickCard(context.maul);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames([]);
            });
        });
    });
});
