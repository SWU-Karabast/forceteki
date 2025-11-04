describe('Reconnaissance', function () {
    integration(function (contextRef) {
        it('Reconnaissance\'s ability should draw 2 cards if we control a ground unit and a space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['reconnaissance'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.reconnaissance);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda).toBeInZone('hand', context.player1);
            expect(context.awing).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
            expect(context.player1.hand.length).toBe(2);
        });

        it('Reconnaissance\'s ability should not draw 2 cards if we do not control a space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['reconnaissance'],
                    groundArena: ['wampa'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
                player2: {
                    spaceArena: ['green-squadron-awing'],
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.reconnaissance);
            expect(context.player1).toHavePrompt('Playing Reconnaissance will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(0);
        });

        it('Reconnaissance\'s ability should not draw 2 cards if we do not control a ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['reconnaissance'],
                    spaceArena: ['green-squadron-awing', 'phoenix-squadron-awing'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.reconnaissance);
            expect(context.player1).toHavePrompt('Playing Reconnaissance will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(0);
        });
    });
});