describe('Ruping Rider', function() {
    integration(function(contextRef) {
        it('Ruping Rider\'s ability should does nothing if our base does not have 15 damage or more', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ruping-rider'],
                },
                player2: {
                    base: { card: 'echo-base', damage: 15 }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rupingRider);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(15);
        });

        it('Ruping Rider\'s ability should deal 2 damage to a base if our base gets 15 damage or more', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ruping-rider'],
                    base: { card: 'echo-base', damage: 15 }
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.rupingRider);
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(15);
            expect(context.p2Base.damage).toBe(2);
        });
    });
});
