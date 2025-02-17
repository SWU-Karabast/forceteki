describe('Independent Senator', function () {
    integration(function (contextRef) {
        it('Independent Senator\'s should exhaust a unit with 4 or less power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['independent-senator']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['gladiator-star-destroyer', 'green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.independentSenator);
            context.player1.clickPrompt('Exhaust a unit with 4 or less power.');

            // can choose any units
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa, context.independentSenator]);

            // Exhaust green squadron A wing
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.exhausted).toBeTrue();
            expect(context.independentSenator.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
