describe('Urgent Mission', function () {
    integration(function (contextRef) {
        it('should deal 2 damage to your base and draw 2 cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['urgent-mission'],
                    deck: ['wampa', 'atst', 'battlefield-marine', 'cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.urgentMission);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(2);
            expect(context.player1.hand.length).toBe(2);
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
        });

        it('should deal 2 damage to your base even if you cannot draw 2 cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['urgent-mission'],
                    deck: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.urgentMission);

            expect(context.p1Base.damage).toBe(5);
            expect(context.player1.hand.length).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
