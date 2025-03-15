describe('Grim Valor', function () {
    integration(function (contextRef) {
        it('Grim Valor\'s attached unit gain on when defeated ability\'s may exhaust a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['atst'],
                    leader: { card: 'admiral-piett#commanding-the-armada', deployed: true }
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['grim-valor'] }, 'wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.admiralPiett, context.wampa]);
            context.player2.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
        });
    });
});
