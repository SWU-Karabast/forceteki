describe('Chopper, War Hero', function() {
    integration(function(contextRef) {
        it('Chopper\'s ability should make each player discard a card when he deals combat damage to a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['chopper#war-hero'],
                    hand: ['wampa']
                },
                player2: {
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Attack the opponent's base with Chopper
            context.player1.clickCard(context.chopper);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            context.player1.clickCard(context.p2Base);

            // Each player should be prompted to discard a card (starting with the active player)
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeAbleToSelectExactly([context.vanquish]);
            context.player2.clickCard(context.vanquish);

            // Verify both hands are now empty
            expect(context.wampa).toBeInZone('discard', context.player1);
            expect(context.vanquish).toBeInZone('discard', context.player2);
            expect(context.player1.hand.length).toBe(0);
            expect(context.player2.hand.length).toBe(0);

            // Verify attack resolved (Chopper should be exhausted and base took damage equal to Chopper's power)
            expect(context.chopper.exhausted).toBe(true);
            expect(context.p2Base.damage).toBe(4);
        });

        // Ruling 2026-05-06: when Chopper's ability makes "each player discard a card", the discards are
        // simultaneous — each player chooses a card from their hand and they are discarded at the same
        // time, so neither player's choice can be influenced by seeing the other's discard first.
        // NOTE: this may require an engine change — the current implementation prompts the players
        // sequentially (starting with the active player), which could leak information. Documents the
        // intended simultaneous-choice behavior.
        xit('has both players choose their discard simultaneously (no information leak between players)', function () {
            // Chopper deals combat damage to a base, making each player discard a card. Each player
            // selects their discard without seeing the other player's choice first, and both cards are
            // discarded simultaneously.
        });
    });
});
