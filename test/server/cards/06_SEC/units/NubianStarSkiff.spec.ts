describe('Nubian Star Skiff', function () {
    integration(function (contextRef) {
        describe('Nubian Star Skiff\'s conditional Restore 2', function () {
            it('should heal 2 when you control an Official unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['nubian-star-skiff'],
                        groundArena: ['major-partagaz#healthcare-provider'], // Official unit to enable Restore 2
                        base: { card: 'dagobah-swamp', damage: 6 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    },
                });

                const { context } = contextRef;

                // Attack with the Nubian Star Skiff; with an Official in play, it should have Restore 2
                context.player1.clickCard(context.nubianStarSkiff);
                context.player1.clickCard(context.p2Base);

                // Base should heal 2 (from 6 to 4)
                expect(context.p1Base.damage).toBe(4);
            });

            it('should not heal when you do not control an Official unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['nubian-star-skiff'],
                        base: { card: 'dagobah-swamp', damage: 6 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    },
                });

                const { context } = contextRef;

                // Attack with the Nubian Star Skiff; without an Official, it should not have Restore 2
                context.player1.clickCard(context.nubianStarSkiff);
                context.player1.clickCard(context.p2Base);

                // Base damage remains unchanged
                expect(context.p1Base.damage).toBe(6);
            });
        });
    });
});
