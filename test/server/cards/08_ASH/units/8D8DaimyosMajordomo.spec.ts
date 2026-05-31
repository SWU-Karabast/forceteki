describe('8D8, Daimyo\'s Majordomo', function() {
    integration(function(contextRef) {
        describe('8D8\'s action ability', function() {
            it('should deal 1 damage to another friendly unit and search deck for a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo', 'wampa'],
                        deck: ['porg', 'battlefield-marine', 'xwing', 'awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.d8D8);
                context.player1.clickCard(context.wampa);

                // TODO: Verify 1 damage is dealt to the target unit
                // TODO: Verify deck search for a unit, reveal, and draw
            });

            it('should not trigger deck search if no damage is dealt', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo', 'wampa'],
                        deck: ['porg', 'battlefield-marine', 'xwing', 'awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                // TODO: Set up scenario where damage is prevented or not dealt
                // TODO: Verify no deck search occurs
            });

            it('should not have valid targets if no other friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo'],
                        deck: ['porg', 'battlefield-marine', 'xwing', 'awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                // TODO: Verify ability cannot be activated without other friendly units
            });

            it('should search top 5 cards only', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo', 'wampa'],
                        deck: ['porg', 'battlefield-marine', 'xwing', 'awing', 'yoda#old-master', 'han-solo#scruffy-looking-nerf-herder']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.d8D8);
                context.player1.clickCard(context.wampa);

                // TODO: Verify only top 5 cards are searched
                // TODO: Verify 6th card is not accessible
            });
        });
    });
});
