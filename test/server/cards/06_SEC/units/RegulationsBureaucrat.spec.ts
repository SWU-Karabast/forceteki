describe('Regulations Bureaucrat', function () {
    integration(function (contextRef) {
        describe('Regulations Bureaucrat\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['regulations-bureaucrat'],
                    },
                });
            });

            it('should exhaust an enemy resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.regulationsBureaucrat);
                context.player1.clickPrompt('Exhaust a resource');
                context.player1.clickPrompt('Opponent');

                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust a friendly resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.regulationsBureaucrat);
                context.player1.clickPrompt('Exhaust a resource');
                context.player1.clickPrompt('You');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});