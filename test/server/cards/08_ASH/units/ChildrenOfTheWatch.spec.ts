describe('Children of the Watch', function() {
    integration(function(contextRef) {
        it('Children of the Watch\'s ability should create 2 mandalorian tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['children-of-the-watch'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.childrenOfTheWatch);
            context.player1.clickPrompt('Resolve all (2)');

            expect(context.player2).toBeActivePlayer();

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(2);
            expect(mandalorians.every((x) => x.exhausted)).toBeTrue();
        });
    });
});