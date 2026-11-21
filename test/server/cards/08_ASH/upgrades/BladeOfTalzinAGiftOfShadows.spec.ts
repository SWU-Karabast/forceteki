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

        it('Blade of Talzin\'s ability should not return to hand if the Night unit it was attached to was taken and defeated by No Glory, Only Results', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'merrin#alone-with-the-dead', upgrades: ['blade-of-talzin#a-gift-of-shadows'] }]
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.merrin);

            // player1 still controls the upgrade, but Merrin was controlled by player2 (an enemy Night unit) when she was defeated
            expect(context.merrin).toBeInZone('discard', context.player1);
            expect(context.bladeOfTalzin).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });

        it('Blade of Talzin\'s ability should not return to hand if it was on an enemy Night unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['blade-of-talzin#a-gift-of-shadows', 'rivals-fall'],
                },
                player2: {
                    groundArena: ['merrin#alone-with-the-dead']
                }
            });

            const { context } = contextRef;

            // player1 controls the upgrade but attaches it to player2's Night unit
            context.player1.clickCard(context.bladeOfTalzin);
            context.player1.clickCard(context.merrin);
            expect(context.merrin).toHaveExactUpgradeNames(['blade-of-talzin#a-gift-of-shadows']);
            context.player2.passAction();

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.merrin);

            expect(context.merrin).toBeInZone('discard', context.player2);
            expect(context.bladeOfTalzin).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
