describe('Imprisoned', function() {
    integration(function(contextRef) {
        it('Imprisoned\'s ability should cancel all abilities on attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['protector'],
                    spaceArena: [{ card: 'avenger#hunting-star-destroyer', upgrades: ['imprisoned'] }]
                },
                player2: {
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.avenger);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            context.player1.clickCard(context.protector);
            context.player1.clickCard(context.avenger);

            context.player2.clickCard(context.cartelSpacer);
            expect(context.player2).toBeAbleToSelectExactly([context.avenger, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });
    });
});
