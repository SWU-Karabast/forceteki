describe('Han Solo, Scruffy Looking Nerf Herder', function() {
    integration(function(contextRef) {
        it('should give -2/-0 to the defender', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['han-solo#scruffylooking-nerf-herder'],
                },
                player2: {
                    groundArena: ['consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hanSolo);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.hanSolo.damage).toBe(1);
            expect(context.consularSecurityForce.damage).toBe(6);
            expect(context.consularSecurityForce.getPower()).toBe(3);
        });
    });
});
