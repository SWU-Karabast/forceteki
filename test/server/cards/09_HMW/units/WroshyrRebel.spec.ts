describe('Wroshyr Rebel', function() {
    integration(function(contextRef) {
        it('should get +1/+0 for every 2 resources you control', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wroshyr-rebel'],
                    resources: 8
                }
            });

            const { context } = contextRef;

            // 8 resources -> +4/+0 (0/4 -> 4/4)
            expect(context.wroshyrRebel.getPower()).toBe(4);
            expect(context.wroshyrRebel.getHp()).toBe(4);
        });

        it('should round down when you control an odd number of resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wroshyr-rebel'],
                    resources: 5
                }
            });

            const { context } = contextRef;

            // 5 resources -> +2/+0 (0/4 -> 2/4)
            expect(context.wroshyrRebel.getPower()).toBe(2);
            expect(context.wroshyrRebel.getHp()).toBe(4);
        });

        it('should get no bonus with fewer than 2 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wroshyr-rebel'],
                    resources: 1
                }
            });

            const { context } = contextRef;

            expect(context.wroshyrRebel.getPower()).toBe(0);
            expect(context.wroshyrRebel.getHp()).toBe(4);
        });

        it('should still count exhausted resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wroshyr-rebel'],
                    hand: ['battlefield-marine'],
                    resources: 6
                }
            });

            const { context } = contextRef;

            // 6 resources -> +3/+0
            expect(context.wroshyrRebel.getPower()).toBe(3);

            // Playing a card exhausts resources but does not reduce the count
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.wroshyrRebel.getPower()).toBe(3);
            expect(context.wroshyrRebel.getHp()).toBe(4);
        });

        it('should still count resources you do not own', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arquitens-assault-cruiser'],
                    groundArena: ['wroshyr-rebel'],
                    base: 'echo-base',
                    resources: 9
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.wroshyrRebel.getPower()).toBe(5);
            expect(context.wroshyrRebel.getHp()).toBe(4);
            expect(context.awing).toBeInZone('resource', context.player1);
        });
    });
});
