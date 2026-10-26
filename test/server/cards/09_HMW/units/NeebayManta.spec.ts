describe('Neebray Manta', function() {
    integration(function(contextRef) {
        it('Neebray Manta\'s when played ability should draw 3 cards', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['neebray-manta'],
                    deck: ['battlefield-marine', 'wampa', 'porg', 'daring-raid']
                },
                player2: {
                    deck: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.neebrayManta);

            expect(context.neebrayManta).toBeInZone('spaceArena');
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.daringRaid).toBeInZone('deck', context.player1);
            expect(context.awing).toBeInZone('deck', context.player2);
            expect(context.player1.hand.length).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Neebray Manta\'s when played ability should deal 3 damage to the base for each card that cannot be drawn', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['neebray-manta'],
                    deck: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.neebrayManta);

            // Only 1 of the 3 cards can be drawn; the 2 failed draws deal 3 damage each
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.p1Base.damage).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
