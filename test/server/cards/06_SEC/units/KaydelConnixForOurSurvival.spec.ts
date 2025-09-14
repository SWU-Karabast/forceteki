describe('Kaydel Connix, For Our Survival', function () {
    integration(function (contextRef) {
        it('Kaydel Connix\'s when played ability may defeat all non-unique upgrades on a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kaydel-connix#for-our-survival'],
                    groundArena: ['vanguard-infantry']
                },
                player2: {
                    groundArena: [
                        {
                            card: 'consular-security-force',
                            upgrades: [
                                'shield',                // non-unique
                                'generals-blade',        // non-unique
                                'the-darksaber',         // unique
                                'lukes-lightsaber'       // unique
                            ]
                        }
                    ]
                }
            });

            const { context } = contextRef;

            // Play Kaydel Connix
            context.player1.clickCard(context.kaydelConnix);

            // Can target any unit
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            expect(context.player1).toHavePassAbilityButton();

            // Target the enemy unit
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            // Non-unique upgrades are defeated; unique remains
            expect(context.consularSecurityForce).toHaveExactUpgradeNames(['the-darksaber', 'lukes-lightsaber']);
            expect(context.generalsBlade).toBeInZone('discard');
        });
    });
});
