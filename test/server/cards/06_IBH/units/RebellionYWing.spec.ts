describe('Rebellion Y-Wing', function() {
    integration(function(contextRef) {
        it('Rebellion Y-Wing\'s ability should deal 1 damage to a base when attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['rebellion-ywing']
                },
                player2: {
                    spaceArena: ['tie-bomber']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rebellionYwing);
            context.player1.clickCard(context.tieBomber);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(1);
        });
    });
});