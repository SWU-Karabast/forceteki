describe('Gold Leader, Fastest Ship In The Fleet', function () {
    integration(function (contextRef) {
        it('Gold Leader, Fastest Ship In The Fleet\'s ability should create a tie fighter token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['gold-leader#fastest-ship-in-the-fleet', 'alliance-xwing'],
                },
                player2: {
                    spaceArena: ['bright-hope#the-last-transport'],
                }
            });

            const { context } = contextRef;

            // Attack with Gold Leader should not reduce the power of defender
            context.player1.clickCard(context.goldLeader);
            context.player1.clickCard(context.brightHope);

            // Assert the ability
            expect(context.player2).toBeActivePlayer();
            expect(context.goldLeader.damage).toBe(2);
            expect(context.brightHope.damage).toBe(5);

            // Reset the game state to test the ability
            context.brightHope.damage = 0;

            // Attack Gold Leader with Bright Hope
            context.player2.clickCard(context.brightHope);
            context.player2.clickCard(context.goldLeader);

            // Assert the ability
            expect(context.goldLeader.damage).toBe(3); // Bright Hope base power is 2 - 1 from Gold Leader's ability
            expect(context.brightHope.getPower()).toBe(2);

            // Reset the game state to test the ability
            context.brightHope.damage = 0;
            context.brightHope.exhausted = false;
            context.player1.passAction();

            context.player2.clickCard(context.brightHope);
            context.player2.clickCard(context.allianceXwing);

            expect(context.allianceXwing.damage).toBe(2); // No reduction in power as Gold Leader's ability only affects the attacker
        });
    });
});
