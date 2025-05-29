describe('Resupply', function() {
    integration(function(contextRef) {
        describe('Resupply\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['resupply'],
                        leader: 'leia-organa#alliance-general'
                    }
                });
            });

            it('should put Resupply into play as a resource', function () {
                const { context } = contextRef;

                const startingResources = context.player1.readyResourceCount;

                context.player1.clickCard(context.resupply);

                expect(context.resupply).toBeInZone('resource');
                expect(context.resupply.exhausted).toBe(true);
                expect(context.player1.resources.length).toBe(startingResources + 1);
                expect(context.player1.readyResourceCount).toBe(startingResources - 3);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.getChatLogs(1)).toContain('player1 plays Resupply to move Resupply to their resources');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
