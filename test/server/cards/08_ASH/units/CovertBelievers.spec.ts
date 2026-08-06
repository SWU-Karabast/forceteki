describe('Covert Believers', function() {
    integration(function(contextRef) {
        it('Covert Believers\'s ability should create a mandalorian token when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['covert-believers'],
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.covertBelievers);

            expect(context.player1).toBeActivePlayer();

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(1);
            expect(mandalorians.every((x) => x.exhausted)).toBeTrue();
        });

        it('Covert Believers\'s ability should work with NGOR', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['covert-believers'],
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.covertBelievers);

            expect(context.player1).toBeActivePlayer();

            const mandalorians = context.player2.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(1);
            expect(mandalorians.every((x) => x.exhausted)).toBeTrue();
        });
    });
});