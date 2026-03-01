describe('Kill Switch\'s ability', function () {
    integration(function (contextRef) {
        it('should exhaust targeted unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kill-switch'],
                    groundArena: ['outspoken-representative']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.killSwitch);
            expect(context.player1).toBeAbleToSelectExactly([context.outspokenRepresentative]);
            context.player1.clickCard(context.outspokenRepresentative);
            expect(context.outspokenRepresentative.exhausted).toBeTrue();
        });

        it('should defeat unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kill-switch'],
                    groundArena: ['death-star-stormtrooper']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.killSwitch);
            expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper]);
            context.player1.clickCard(context.deathStarStormtrooper);
            expect(context.deathStarStormtrooper).toBeInZone('discard');
        });
    });
});