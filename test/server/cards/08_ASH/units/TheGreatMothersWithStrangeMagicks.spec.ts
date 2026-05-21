describe('The Great Mothers, With Strange Magicks', function() {
    integration(function(contextRef) {
        it('should defeat a non-leader unit it dealt combat damage to when the attack ends', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    groundArena: ['alderaanian-envoys']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.alderaanianEnvoys);

            expect(context.theGreatMothers.damage).toBe(3);
            expect(context.alderaanianEnvoys).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not defeat anything if it dealt combat damage to a base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    groundArena: ['alderaanian-envoys']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(6);
            expect(context.alderaanianEnvoys).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not defeat a leader unit it dealt combat damage to', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-great-mothers#with-strange-magicks']
                },
                player2: {
                    leader: { card: 'satine-kryze#standing-on-principles', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.satineKryze);

            expect(context.satineKryze.damage).toBe(6);
            expect(context.satineKryze).toBeInZone('groundArena', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should grant its When Attack Ends ability through Support for the supported attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-great-mothers#with-strange-magicks'],
                    groundArena: ['scavenging-sandcrawler'],
                    resources: 10
                },
                player2: {
                    groundArena: ['maul#master-of-the-shadow-collective']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theGreatMothers);
            context.player1.clickCard(context.scavengingSandcrawler);
            context.player1.clickCard(context.maul);

            expect(context.scavengingSandcrawler.damage).toBe(6);
            expect(context.maul).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
