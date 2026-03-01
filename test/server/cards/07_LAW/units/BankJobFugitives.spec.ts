describe('Bank Job Fugitives', function() {
    integration(function(contextRef) {
        describe('Bank Job Fugitives\'s ability', function() {
            it('should create a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bank-job-fugitives'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bankJobFugitives);

                expect(context.bankJobFugitives).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(1);
            });
        });
    });
});
