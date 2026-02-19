describe('Salvaged Materials', function() {
    integration(function(contextRef) {
        it('Salvaged Materials\'s ability should play an Item upgrade from discard for 3 less resources. At the start of the next regroup phase, defeat it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-materials'],
                    discard: ['thermal-detonator', 'protector', 'the-darksaber'],
                    groundArena: ['wampa'],
                    leader: 'captain-rex#fighting-for-his-brothers',
                    base: 'jabbas-palace'
                },
                player2: {
                    discard: ['electrostaff']
                }
            });

            const { context } = contextRef;

            // Play Salvaged Materials
            context.player1.clickCard(context.salvagedMaterials);

            expect(context.player1).toBeAbleToSelectExactly([context.thermalDetonator, context.theDarksaber]);

            context.player1.clickCard(context.theDarksaber);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.wampa).toHaveExactUpgradeNames(['the-darksaber']);

            context.moveToRegroupPhase();

            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.theDarksaber).toBeInZone('discard', context.player1);
        });

        it('Salvaged Materials\'s ability should not defeat the played upgrade at the start of regroup phase if it is not the same copy of played upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvaged-materials'],
                    discard: ['the-darksaber'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hand: ['bamboozle']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.salvagedMaterials);
            // play the darksaber on wampa with salvaged materials
            context.player1.clickCard(context.theDarksaber);
            context.player1.clickCard(context.wampa);

            // bouce back the darksaber
            context.player2.clickCard(context.bamboozle);
            context.player2.clickCard(context.wampa);

            // play again the darksaber
            context.player1.clickCard(context.theDarksaber);
            context.player1.clickCard(context.wampa);

            context.moveToRegroupPhase();

            // the darksaber should not be defeated
            expect(context.wampa).toHaveExactUpgradeNames(['the-darksaber']);
        });
    });
});
