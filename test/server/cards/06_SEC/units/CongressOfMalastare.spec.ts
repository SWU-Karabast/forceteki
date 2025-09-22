describe('Congress of Malastare', function () {
    integration(function (contextRef) {
        it('should make the first Upgrade you play each phase cost 1 less, and not affect the opponent\'s Upgrades', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#walking-carpet',
                    hand: ['on-top-of-things', 'top-target', 'electrostaff'],
                    groundArena: ['congress-of-malastare', 'battlefield-marine'],
                    base: 'jedha-city'
                },
                player2: {
                    hand: ['devotion'],
                    spaceArena: ['system-patrol-craft'],
                    base: 'remote-village',
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Opponent plays an upgrade this phase; should NOT be discounted by our Congress
            context.player2.clickCard(context.devotion);
            context.player2.clickCard(context.systemPatrolCraft);
            expect(context.player2.exhaustedResourceCount).toBe(2); // full cost 2

            // First upgrade this phase (On Top of Things, cost 2) should be discounted by 1
            context.player1.clickCard(context.onTopOfThings);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(1); // 2 - 1 = 1

            context.player2.passAction();

            // Back to us, second upgrade this phase (Top Target, cost 1) should NOT be discounted
            context.player1.clickCard(context.topTarget);
            context.player1.clickCard(context.systemPatrolCraft);
            expect(context.player1.exhaustedResourceCount).toBe(2); // 1 + 1

            // Next action phase: discount should reset and apply to the first upgrade we play this phase
            context.moveToNextActionPhase();
            context.player2.passAction();
            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(1); // discounted to 1 this phase again
        });
    });
});
