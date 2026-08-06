describe('Intimitation', function () {
    integration(function (contextRef) {
        it('Intimidation\'s ability should draw 2 cards if we control a ground unit with 4 or more power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['intimidation'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.intimidation);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda).toBeInZone('hand', context.player1);
            expect(context.awing).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
            expect(context.player1.hand.length).toBe(2);
        });

        it('Intimidation\'s ability should draw 2 cards if we control a space unit with 4 or more power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['intimidation'],
                    spaceArena: ['rebellious-hammerhead'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.intimidation);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda).toBeInZone('hand', context.player1);
            expect(context.awing).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
            expect(context.player1.hand.length).toBe(2);
        });

        it('Intimidation\'s ability should not draw 2 cards if the enemy has a 4 or more power space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['intimidation'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
                player2: {
                    spaceArena: ['rebellious-hammerhead'],
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.intimidation);
            expect(context.player1).toHavePrompt('Playing Intimidation will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(0);
        });

        it('Intimidation\'s ability should not draw 2 cards if the enemy has a ground unit with 4 or more power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['intimidation'],
                    spaceArena: ['green-squadron-awing', 'phoenix-squadron-awing'],
                    deck: ['yoda#old-master', 'awing', 'atst']
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.intimidation);
            expect(context.player1).toHavePrompt('Playing Intimidation will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(0);
        });
    });
});