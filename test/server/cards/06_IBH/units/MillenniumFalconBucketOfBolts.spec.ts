describe('Millennium Falcon, Bucket Of Bolts', function () {
    integration(function (contextRef) {
        it('Millennium Falcon\'s ability should not ready the unit when played if your base does not have more damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['millennium-falcon#bucket-of-bolts'],
                    base: { card: 'jabbas-palace', damage: 0 }
                },
                player2: {
                    base: { card: 'echo-base', damage: 0 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);

            // Verify the unit is exhausted (not readied) after being played
            expect(context.millenniumFalcon.exhausted).toBe(true);
        });

        it('Millennium Falcon\'s ability should ready the unit when played if your base has more damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['millennium-falcon#bucket-of-bolts'],
                    base: { card: 'jabbas-palace', damage: 3 }
                },
                player2: {
                    base: { card: 'echo-base', damage: 1 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);

            // Verify the unit is readied after being played
            expect(context.millenniumFalcon.exhausted).toBe(false);
        });
    });
});