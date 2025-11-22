describe('Cost adjustment', function() {
    integration(function (contextRef) {
        describe('Stacked penalty cost adjusters', function () {
            it('should not double-count for two adjusters that ignore all aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'energy-conversion-lab',
                        hand: ['echo#valiant-arc-trooper'],
                        groundArena: ['omega#part-of-the-squad']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.echo);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });
    });
});
