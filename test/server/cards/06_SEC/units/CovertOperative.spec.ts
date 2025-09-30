describe('Covert Operative', function() {
    integration(function(contextRef) {
        it('Covert Operative\'s ability should capture an enemy non-leader unit that costs 2 or less when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['covert-operative']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'boba-fett#daimyo', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.covertOperative);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeCapturedBy(context.covertOperative);
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.cartelSpacer).toBeInZone('spaceArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
