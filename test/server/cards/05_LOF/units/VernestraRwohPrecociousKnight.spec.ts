describe('Vernestra Rwoh, Precocious Knight', function () {
    integration(function (contextRef) {
        it('Vernestra Rwoh, Precocious Knight\'s ability should allow the player to use the Force to ready the unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vernestra-rwoh#precocious-knight'],
                    hasForceToken: true,
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.vernestraRwohPrecociousKnight);

            expect(context.vernestraRwohPrecociousKnight.exhausted).toBeTrue();

            expect(context.player1).toHavePassAbilityPrompt('Use the Force');
            context.player1.clickPrompt('Trigger');

            expect(context.vernestraRwohPrecociousKnight.exhausted).toBeFalse();
        });
    });
});
