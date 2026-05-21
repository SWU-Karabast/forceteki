describe('Cavern Angels X-Wing', function() {
    integration(function(contextRef) {
        it('should deal 2 damage to a base when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['cavern-angels-xwing']
                },
                player2: {
                    spaceArena: ['tie-fighter'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.tieFighter);
            context.player2.clickCard(context.cavernAngelsXwing);

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(2);
        });

        it('should deal 2 damage to a base when defeated (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['cavern-angels-xwing']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.cavernAngelsXwing);

            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(2);
        });
    });
});
