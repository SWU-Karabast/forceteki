describe('Rafa Martez, Shrewd Sister', function () {
    integration(function (contextRef) {
        it('Rafa Martez\'s ability should deal 1 damage to a friendly unit and ready a resource when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    hand: ['rafa-martez#shrewd-sister'],
                    groundArena: ['liberated-slaves'],
                    spaceArena: ['millennium-falcon#piece-of-junk'],
                    resources: 10
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rafaMartez);

            // Rafa Martex costs 3 resources to play
            expect(context.player1.readyResourceCount).toBe(7);
            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly unit and ready a resource');
            expect(context.player1).toBeAbleToSelectExactly([context.rafaMartez, context.liberatedSlaves, context.millenniumFalcon]);

            // Deal a damage to a friendly unit and ready a resource
            context.player1.clickCard(context.liberatedSlaves);

            expect(context.liberatedSlaves.damage).toBe(1);
            expect(context.player1.readyResourceCount).toBe(8);
            expect(context.player2).toBeActivePlayer();
        });

        it('Rafa Martez\'s ability should deal 1 damage to a friendly unit and ready a resource on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    hand: ['liberated-slaves'],
                    groundArena: ['rafa-martez#shrewd-sister'],
                    spaceArena: ['millennium-falcon#piece-of-junk'],
                    resources: 10
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.liberatedSlaves);

            // Liberated Slaves costs 3 resources to play
            expect(context.player1.readyResourceCount).toBe(7);

            context.player2.passAction();
            context.player1.clickCard(context.rafaMartez);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly unit and ready a resource');
            expect(context.player1).toBeAbleToSelectExactly([context.rafaMartez, context.liberatedSlaves, context.millenniumFalcon]);

            // Deal a damage to a friendly unit and ready a resource
            context.player1.clickCard(context.liberatedSlaves);

            expect(context.liberatedSlaves.damage).toBe(1);
            expect(context.player1.readyResourceCount).toBe(8);
            expect(context.player2).toBeActivePlayer();
        });
    });
});