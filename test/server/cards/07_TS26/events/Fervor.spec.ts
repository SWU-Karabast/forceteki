describe('Fervor', function() {
    integration(function(contextRef) {
        it('Fervor\'s ability should ready a unit and deal 3 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fervor'],
                    groundArena: [{ card: 'wampa', exhausted: true }],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.fervor);
            expect(context.player1).toHavePrompt('Ready a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing, context.atst]);
            context.player1.clickCard(context.wampa);
            expect(context.player1).toHavePrompt('Deal 3 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing, context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.atst.damage).toBe(3);
        });
    });
});
