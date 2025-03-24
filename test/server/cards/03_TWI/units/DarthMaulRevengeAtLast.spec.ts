describe('Darth Maul, Revenge At Last', function() {
    integration(function(contextRef) {
        it('should not be prompted to select multiple targets when there are no enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
        });

        it('should not be prompted to select multiple targets when there is only one enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            expect(context.darthMaul.damage).toBe(4);
            expect(context.wampa).toBeInZone('discard');
        });

        it('test', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
        });
    });
});
