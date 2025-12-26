describe('Jaunty Light Freighter', function () {
    integration(function (contextRef) {
        describe('Jaunty Light Freighter\'s ability', function () {
            it('gives itself Experience tokens equal to the number of different aspects among units you control (itself only → 2)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jaunty-light-freighter']
                    }
                });

                const { context } = contextRef;

                // Play Jaunty Light Freighter from hand
                context.player1.clickCard(context.jauntyLightFreighter);

                // It has Command + Heroism itself → 2 unique aspects total
                expect(context.jauntyLightFreighter).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('counts only unique aspects (ally with overlapping aspect does not increase the total)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['diplomatic-envoy'], // Command aspect (overlaps with Jaunty)
                        hand: ['jaunty-light-freighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jauntyLightFreighter);

                // Still only Command + Heroism → 2 tokens
                expect(context.jauntyLightFreighter).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('includes aspects from other friendly units (adds Cunning ally → 3)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'awing', upgrades: ['sudden-ferocity'] }], // Cunning aspect
                        hand: ['jaunty-light-freighter'],
                        leader: 'chewbacca#walking-carpet'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jauntyLightFreighter);

                // Command + Heroism (self) + Cunning (ally) → 3 tokens
                expect(context.jauntyLightFreighter).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });
        });
    });
});
