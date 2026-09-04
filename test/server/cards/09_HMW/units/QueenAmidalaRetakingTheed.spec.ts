describe('Queen Amidala, Retaking Theed', function() {
    integration(function(contextRef) {
        it('Queen Amidala\'s constant ability should reduce her cost if her base is upgraded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['queen-amidala#retaking-theed'],
                    base: { card: 'theed-palace', upgrades: ['alliance-shield-generator'] },
                    leader: 'luke-skywalker#faithful-friend',
                    resources: 5
                },
                player2: {
                    base: 'tarkintown'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.queenAmidala);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.readyResourceCount).toBe(3);
        });

        it('Queen Amidala\'s constant ability should reduce her cost if both bases are upgraded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['queen-amidala#retaking-theed'],
                    base: { card: 'theed-palace', upgrades: ['alliance-shield-generator'] },
                    leader: 'luke-skywalker#faithful-friend',
                    resources: 5
                },
                player2: {
                    base: { card: 'tarkintown', upgrades: ['dark-sanctum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.queenAmidala);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.readyResourceCount).toBe(3);
        });

        it('Queen Amidala\'s constant ability should not reduce her cost if the enemy base is upgraded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['queen-amidala#retaking-theed'],
                    base: 'tarkintown',
                    leader: 'luke-skywalker#faithful-friend',
                    resources: 5
                },
                player2: {
                    base: { card: 'theed-palace', upgrades: ['alliance-shield-generator'] },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.queenAmidala);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.readyResourceCount).toBe(1);
        });
    });
});