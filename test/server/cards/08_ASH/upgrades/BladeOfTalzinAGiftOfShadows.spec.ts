describe('Blade of Talzin, A Gift of Shadows', function() {
    integration(function(contextRef) {
        it('Blade of Talzin\'s ability should not return to hand if parent card is not a Night unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['blade-of-talzin#a-gift-of-shadows'] }]
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.bladeOfTalzin).toBeInZone('discard', context.player2);
        });

        it('Blade of Talzin\'s ability should return to hand if parent card is a Night unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                },
                player2: {
                    groundArena: [{ card: 'merrin#alone-with-the-dead', upgrades: ['blade-of-talzin#a-gift-of-shadows'] }]
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.merrin);

            expect(context.player2).toBeActivePlayer();
            expect(context.bladeOfTalzin).toBeInZone('hand', context.player2);
        });

        it('Blade of Talzin\'s ability should return to hand if parent card is a Night unit (should work when parent card is returned to hand)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['waylay'],
                },
                player2: {
                    groundArena: [{ card: 'merrin#alone-with-the-dead', upgrades: ['blade-of-talzin#a-gift-of-shadows'] }]
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.waylay);
            context.player1.clickCard(context.merrin);

            expect(context.player2).toBeActivePlayer();
            expect(context.bladeOfTalzin).toBeInZone('hand', context.player2);
        });
    });
});