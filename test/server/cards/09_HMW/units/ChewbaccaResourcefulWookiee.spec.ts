describe('Chewbacca, Resourceful Wookiee', function() {
    integration(function(contextRef) {
        it('should gain Raid 1 for each exhausted resource (3 resources exhausted)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['chewbacca#resourceful-wookiee'],
                    resources: 6
                }
            });

            const { context } = contextRef;
            context.player1.exhaustResources(3);

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
            expect(context.chewbacca.getPower()).toBe(0);
            expect(context.chewbacca.getHp()).toBe(5);
        });

        it('should not gain Overwhelm if all our resources are not exhausted', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['chewbacca#resourceful-wookiee'],
                    resources: 6
                },
                player2: {
                    groundArena: ['porg']
                }
            });

            const { context } = contextRef;
            context.player1.exhaustResources(3);

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(0);
            expect(context.chewbacca.getPower()).toBe(0);
            expect(context.chewbacca.getHp()).toBe(5);
        });

        it('should gain Raid 1 for each exhausted resource (6 resources exhausted)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['chewbacca#resourceful-wookiee'],
                    resources: 6
                }
            });

            const { context } = contextRef;
            context.player1.exhaustResources(6);

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(6);
            expect(context.chewbacca.getPower()).toBe(0);
            expect(context.chewbacca.getHp()).toBe(5);
        });

        it('should gain Overwhelm if all our resources are exhausted', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['chewbacca#resourceful-wookiee'],
                    resources: 6
                },
                player2: {
                    groundArena: ['porg']
                }
            });

            const { context } = contextRef;
            context.player1.exhaustResources(6);

            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.chewbacca.getPower()).toBe(0);
            expect(context.chewbacca.getHp()).toBe(5);
        });
    });
});
