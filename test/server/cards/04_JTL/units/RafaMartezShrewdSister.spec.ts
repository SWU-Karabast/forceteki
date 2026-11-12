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

            expect(context.player1).toHavePrompt('Choose a player to ready a resource');
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            expect(context.liberatedSlaves.damage).toBe(1);
            expect(context.player1.readyResourceCount).toBe(8);
            expect(context.player2).toBeActivePlayer();
        });

        it('Rafa Martez\'s ability should deal 1 damage to a friendly unit and ready an enemy resource when played', async function () {
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
                    spaceArena: ['green-squadron-awing'],
                    resources: {
                        readyCount: 5,
                        exhaustedCount: 1
                    }
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

            expect(context.player1).toHavePrompt('Choose a player to ready a resource');
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('Opponent');

            expect(context.liberatedSlaves.damage).toBe(1);
            expect(context.player2.readyResourceCount).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('Rafa Martez\'s ability should deal 1 damage to a friendly unit and ready a resource on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    hand: ['swoop-racer'],
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

            context.player1.clickCard(context.swoopRacer);

            // Swoop Racer costs 3 resources to play
            expect(context.player1.readyResourceCount).toBe(7);

            context.player2.passAction();
            context.player1.clickCard(context.rafaMartez);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly unit and ready a resource');
            expect(context.player1).toBeAbleToSelectExactly([context.rafaMartez, context.swoopRacer, context.millenniumFalcon]);

            // Deal a damage to a friendly unit and ready a resource
            context.player1.clickCard(context.swoopRacer);

            expect(context.player1).toHavePrompt('Choose a player to ready a resource');
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            expect(context.swoopRacer.damage).toBe(1);
            expect(context.player1.readyResourceCount).toBe(8);
            expect(context.player2).toBeActivePlayer();
        });

        it('Rafa Martez\'s ability should deal 1 damage to a friendly unit and ready an enemy resource on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    hand: ['swoop-racer'],
                    groundArena: ['rafa-martez#shrewd-sister'],
                    spaceArena: ['millennium-falcon#piece-of-junk'],
                    resources: 10
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                    resources: {
                        readyCount: 5,
                        exhaustedCount: 1
                    }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.swoopRacer);

            // Swoop Racer costs 3 resources to play
            expect(context.player1.readyResourceCount).toBe(7);

            context.player2.passAction();
            context.player1.clickCard(context.rafaMartez);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly unit and ready a resource');
            expect(context.player1).toBeAbleToSelectExactly([context.rafaMartez, context.swoopRacer, context.millenniumFalcon]);

            // Deal a damage to a friendly unit and ready a resource
            context.player1.clickCard(context.swoopRacer);

            expect(context.player1).toHavePrompt('Choose a player to ready a resource');
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('Opponent');

            expect(context.swoopRacer.damage).toBe(1);
            expect(context.player2.readyResourceCount).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });
    });
});