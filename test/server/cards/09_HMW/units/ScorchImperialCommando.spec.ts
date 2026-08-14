describe('Scorch, Imperial Commando', function() {
    integration(function(contextRef) {
        describe('Scorch\'s ability', function() {
            it('should deal 1 damage to an upgraded unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'scorch#imperial-commando', upgrades: ['experience'] }],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['mastery'] }],
                        spaceArena: [{ card: 'mynock', upgrades: ['fulcrum'] }]
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.scorch);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.scorch, context.atst, context.mynock]);

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
            });
            // todo add an upgrade to a base with Fortify to check exclusion
        });
    });
});
