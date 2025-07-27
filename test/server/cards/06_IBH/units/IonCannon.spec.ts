describe('Ion Cannon', function() {
    integration(function(contextRef) {
        it('Ion Cannon\'s ability should deal 3 damage to a space unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ion-cannon', 'wampa'],
                    spaceArena: ['bright-hope#the-last-transport']
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ionCannon);
            context.player1.clickPrompt('Deal 3 damage to a space unit');
            expect(context.player1).toBeAbleToSelectExactly([context.brightHope, context.avenger]);
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger.damage).toBe(3);
            expect(context.ionCannon.exhausted).toBe(true);
        });
    });
});