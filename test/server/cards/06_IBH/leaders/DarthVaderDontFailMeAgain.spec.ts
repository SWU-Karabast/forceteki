describe('Darth Vader, Don\'t Fail Me Again', function () {
    integration(function (contextRef) {
        it('Darth Vader\'s leader side ability should deal 1 damage to a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'darth-vader#dont-fail-me-again',
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);
            context.player1.clickPrompt('Deal 1 damage to a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(1);
            expect(context.darthVaderDontFailMeAgain.exhausted).toBe(true);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Darth Vader\'s leader unit side ability should deal 2 damage to a base when attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true },
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.darthVader);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(2);
        });
    });
});