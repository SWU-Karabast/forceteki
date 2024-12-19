describe('Disaffected Senator', function () {
    integration(function (contextRef) {
        it('abitily should deal 2 damage to a base', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['disaffected-senator'],
                },
                player2: {
                    groundArena: ['wampa'],
                    base: 'security-complex'
                },
            });
            const { context } = contextRef;

            // Click Prompt
            context.player1.clickCard(context.disaffectedSenator);
            context.player1.clickPrompt('Deal 2 damage to a base.');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);

            // Check effect has been done properly and unit is exhausted
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.disaffectedSenator.exhausted).toBe(true);
        });
    });
});