describe('Aggressive Negotiations', function () {
    integration(function (contextRef) {
        it('should initiate an attack and give the attacker +1/+0 for each card in your hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aggressive-negotiations', 'wampa', 'atst'],
                    groundArena: ['rugged-survivors'],
                    leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aggressiveNegotiations);
            context.player1.clickCard(context.ruggedSurvivors);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(3);
            expect(context.p2Base.damage).toBe(6);
            expect(context.ruggedSurvivors.getPower()).toBe(3);
        });
    });
});
