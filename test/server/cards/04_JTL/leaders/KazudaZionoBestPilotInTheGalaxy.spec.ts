describe('Kazuda Ziono, Best Pilot in the Galaxy', function() {
    integration(function(contextRef) {
        describe('leader ability', function() {
            it('should remove all abilites from a friendly unit, and let the controller take an extra action', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'emperors-royal-guard',
                            'emperor-palpatine#master-of-the-dark-side'
                        ],
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy'
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: [
                            'consular-security-force'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.emperorsRoyalGuard);

                // Opponent attacks base because ERG is not sentinel
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeAbleToSelect(context.p1Base);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();

                // Opponent plays Open Fire, defeating ERG because it no longer has the HP modifier
                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.emperorsRoyalGuard);

                expect(context.emperorsRoyalGuard).toBeInZone('discard');
            });
        });
    });
});