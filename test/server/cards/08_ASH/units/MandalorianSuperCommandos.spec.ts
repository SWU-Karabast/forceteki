describe('Mandalorian Super Commandos', function() {
    integration(function(contextRef) {
        it('Mandalorian Super Commandos\'s ability should gets +2/+0 when controlling a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mandalorian-super-commandos'],
                    leader: 'boba-fett#collecting-the-bounty',
                },
                player2: {
                    leader: { card: 'chewbacca#walking-carpet', deployed: true }
                }
            });
            const { context } = contextRef;

            expect(context.mandalorianSuperCommandos.getPower()).toBe(2);
            expect(context.mandalorianSuperCommandos.getHp()).toBe(5);

            context.player1.clickCard(context.bobaFett);
            context.player1.clickPrompt('Deploy Boba Fett');

            expect(context.player2).toBeActivePlayer();

            expect(context.mandalorianSuperCommandos.getPower()).toBe(4);
            expect(context.mandalorianSuperCommandos.getHp()).toBe(5);
        });
    });
});
