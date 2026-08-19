describe('Overgrowth', function() {
    integration(function(contextRef) {
        it('Overgrowth\'s ability should select a friendly unit to deal damage equal to his power to an enemy unit if we control a Kashyyyk base and resource this event', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['overgrowth'],
                    groundArena: ['gungi#finding-himself', 'porg'],
                    base: 'origin-tree'
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.overgrowth);

            expect(context.player1).toHavePrompt('Select a friendly unit who will deal damage equal to its power to an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.porg]);
            context.player1.clickCard(context.gungi);

            expect(context.player1).toHavePrompt('Select an enemy unit to deal 2 damage');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing]);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
            expect(context.overgrowth).toBeInZone('resource', context.player1);
            expect(context.overgrowth.exhausted).toBeTrue();
        });

        it('Overgrowth\'s ability should not select a friendly unit to deal damage to an enemy unit if we do not control a Kashyyyk base but should resource this event', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['overgrowth'],
                    groundArena: ['battlefield-marine'],
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.overgrowth);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(0);
            expect(context.overgrowth).toBeInZone('resource', context.player1);
            expect(context.overgrowth.exhausted).toBeTrue();
        });

        it('Overgrowth\'s ability should resource this event after selecting a friendly unit to deal damage equal to his power to an enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['overgrowth'],
                    groundArena: ['97th-legion#keeping-the-peace-on-sullust'],
                    resources: 5,
                    base: 'origin-tree'
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.overgrowth);

            expect(context.player1).toHavePrompt('Select a friendly unit who will deal damage equal to its power to an enemy unit');
            context.player1.clickCard(context._97thLegion);

            expect(context.player1).toHavePrompt('Select an enemy unit to deal 5 damage');
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();

            // 97th legion's power should still be 5, damage should dealt before resourcing event
            expect(context.atst.damage).toBe(5);
            expect(context.overgrowth).toBeInZone('resource', context.player1);
            expect(context.overgrowth.exhausted).toBeTrue();
        });
    });
});