describe('Soaring Can-Cell', function() {
    integration(function(contextRef) {
        it('should not have Ambush if the base is not Kashyyyk trait', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['soaring-cancell'],
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.soaringCancell);

            expect(context.soaringCancell.hasSomeKeyword('ambush')).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('should have Ambush if the base is Kashyyyk trait', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['soaring-cancell'],
                    base: 'kachirho'
                },
                player2: {
                    groundArena: ['porg'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.soaringCancell);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('discard');
            expect(context.soaringCancell.damage).toBe(1);
        });
    });
});