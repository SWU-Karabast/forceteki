describe('Crackshot V-Wing', function () {
    integration(function (contextRef) {
        it('Crackshot V-Wing\'s ability should deal itself 1 damage as we do not control any other Fighter', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['crackshot-vwing']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.crackshotVwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.crackshotVwing.damage).toBe(1);
        });

        it('Crackshot V-Wing\'s ability should deal not itself 1 damage as we control another Fighter', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['crackshot-vwing'],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.crackshotVwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.crackshotVwing.damage).toBe(0);
        });
    });
});
