describe('Maul, Master of the Shadow Collective', function() {
    integration(function(contextRef) {
        describe('Maul\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        hand: ['one-way-out', 'bravado'],
                        groundArena: ['maul#master-of-the-shadow-collective', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atat-suppressor', 'wampa'],
                        leader: { card: 'han-solo#worth-the-risk', deployed: true }
                    }
                });
            });

            it('should take control of an enemy non-leader unit until Maul leaves the arena if he dealt combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atatSuppressor]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.controller).toBe(context.player1Object);

                // defeat Maul and confirm that control returns to the opponent
                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.maul);

                expect(context.maul).toBeInZone('discard');
                expect(context.wampa.controller).toBe(context.player2Object);
            });
        });
    });
});
