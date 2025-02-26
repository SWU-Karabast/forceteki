describe('Confederate Courier\'s ability', function () {
    integration(function (contextRef) {
        it('should exhaust targeted unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['perilous-position'],
                    groundArena: ['outspoken-representative']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.perilousPosition);
            expect(context.player1).toBeAbleToSelectExactly([context.outspokenRepresentative]);
            context.player1.clickCard(context.outspokenRepresentative);
            expect(context.outspokenRepresentative.exhausted).toBeTrue();
        });

        it('should defeat unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['perilous-position'],
                    groundArena: ['crafty-smuggler']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.perilousPosition);
            expect(context.player1).toBeAbleToSelectExactly([context.craftySmuggler]);
            context.player1.clickCard(context.craftySmuggler);
            expect(context.craftySmuggler).toBeInZone('discard');
        });
    });
});