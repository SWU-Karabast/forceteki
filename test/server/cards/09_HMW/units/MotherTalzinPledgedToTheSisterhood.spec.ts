describe('Mother Talzin, Pledged to the Sisterhood', function() {
    integration(function(contextRef) {
        it('should give Restore 1 to each other friendly unit while in play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'administrators-tower', damage: 5 },
                    groundArena: ['mother-talzin#pledged-to-the-sisterhood', 'battlefield-marine'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Attack with Battlefield Marine to trigger Restore 1
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(4);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.p2Base.damage).toBe(3);

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(7);
        });

        it('should not give Restore 1 to herself', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'administrators-tower', damage: 5 },
                    groundArena: ['mother-talzin#pledged-to-the-sisterhood']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.motherTalzin);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(5);
        });
    });
});
