describe('Bokken Saber', function() {
    integration(function(contextRef) {
        it('Bokken Saber\'s ability should attach to non-Vehicle units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bokken-saber'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['snowspeeder'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bokkenSaber);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['bokken-saber']);
        });

        it('Bokken Saber\'s ability should give an Advantage token when attack ends', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['bokken-saber'] }],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['bokken-saber', 'advantage']);
        });
    });
});
