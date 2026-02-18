describe('Veiled Strength', function() {
    integration(function(contextRef) {
        it('should only attach to non-leader units and attached unit gains Grit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['veiled-strength'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.veiledStrength);

            // not able to select leader units
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
