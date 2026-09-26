describe('Surveillance Cruiser', function() {
    integration(function(contextRef) {
        it('Surveillance Cruiser\'s ability should draw a card if the opponent controls an Endor base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surveillance-cruiser'],
                    deck: ['porg', 'rey#skywalker']
                },
                player2: {
                    base: 'bright-tree-village'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.surveillanceCruiser);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
            expect(context.player1.handSize).toBe(1);
        });

        it('Surveillance Cruiser\'s ability should draw a card if the opponent controls a Kashyyyk base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surveillance-cruiser'],
                    deck: ['porg', 'rey#skywalker']
                },
                player2: {
                    base: 'kachirho'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.surveillanceCruiser);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
            expect(context.player1.handSize).toBe(1);
        });

        it('Surveillance Cruiser\'s ability should draw a card if the opponent controls a Naboo base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surveillance-cruiser'],
                    deck: ['porg', 'rey#skywalker']
                },
                player2: {
                    base: 'theed-palace'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.surveillanceCruiser);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
            expect(context.player1.handSize).toBe(1);
        });

        it('Surveillance Cruiser\'s ability should draw a card if the opponent controls a Tatooine base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surveillance-cruiser'],
                    deck: ['porg', 'rey#skywalker']
                },
                player2: {
                    base: 'jabbas-palace'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.surveillanceCruiser);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
            expect(context.player1.handSize).toBe(1);
        });

        it('Surveillance Cruiser\'s ability should not draw a card if the opponent does not control an Endor, Kashyyyk, Naboo, or Tatooine base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surveillance-cruiser'],
                    deck: ['porg', 'rey#skywalker'],
                    // player1's own base has a matching trait, to confirm only the opponent's base is checked
                    base: 'jabbas-palace'
                },
                player2: {
                    base: 'command-center',
                    // a Naboo-trait unit doesn't count; only the opponent's base trait matters
                    groundArena: ['naboo-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.surveillanceCruiser);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('deck', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
        });
    });
});
