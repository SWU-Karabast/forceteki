describe('Tantive IV, Carrying Hope', function () {
    integration(function (contextRef) {
        it('Tantive IV\'s When Played ability should heal 4 from base if a friendly unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tantive-iv#carrying-hope'],
                    groundArena: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Player 1 attacks Wampa with Battlefield Marine to get it defeated
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.wampa);

            expect(context.battlefieldMarine).toBeInZone('discard');

            context.player2.passAction();

            // Now play Tantive IV
            context.player1.clickCard(context.tantiveIv);

            expect(context.player1.base.damage).toBe(1); // 5 - 4 = 1
            expect(context.player2).toBeActivePlayer();
        });

        it('Tantive IV\'s When Played ability should not heal from base if no friendly unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tantive-iv#carrying-hope'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tantiveIv);

            expect(context.player1.base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('Tantive IV\'s When Played ability should not heal from base if only an enemy unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tantive-iv#carrying-hope'],
                    groundArena: ['wampa'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Player 1 attacks Battlefield Marine with Wampa to defeat it
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard');

            context.player2.passAction();

            // Now play Tantive IV
            context.player1.clickCard(context.tantiveIv);

            expect(context.player1.base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
