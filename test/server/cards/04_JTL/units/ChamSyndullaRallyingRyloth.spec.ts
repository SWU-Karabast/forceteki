describe('Cham Syndulla, Rallying Ryloth', function () {
    integration(function (contextRef) {
        it('Cham Syndulla\'s ability should put the top card of deck in resource if we control less resources than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cham-syndulla#rallying-ryloth'],
                    deck: ['battlefield-marine'],
                    resources: 4
                },
                player2: {
                    resources: 5
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chamSyndulla);

            expect(context.player1).toHavePassAbilityPrompt('Put the top card of your deck into play as a resource');
            context.player1.clickPrompt('Put the top card of your deck into play as a resource');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('resource');
        });

        it('Cham Syndulla\'s ability should not put the top card of deck in resource if we control more or equal resources than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cham-syndulla#rallying-ryloth'],
                    deck: ['battlefield-marine'],
                    resources: 5
                },
                player2: {
                    resources: 5
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chamSyndulla);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('deck');
        });
    });
});
