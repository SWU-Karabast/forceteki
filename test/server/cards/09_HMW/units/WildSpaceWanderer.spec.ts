describe('Wild Space Wanderer', function() {
    integration(function(contextRef) {
        describe('Wild Space Wanderer\'s when played ability', function() {
            it('should defeat an upgrade on a base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wild-space-wanderer'],
                        base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] }
                    },
                    player2: {
                        base: { card: 'colossus', upgrades: ['trap-field'] },
                        groundArena: [{ card: 'wampa', upgrades: ['resilient'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wildSpaceWanderer);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceShieldGenerator, context.trapField]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.trapField);

                expect(context.trapField).toBeInZone('discard', context.player2);
                expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when no base has an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wild-space-wanderer']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['resilient'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wildSpaceWanderer);

                expect(context.wampa).toHaveExactUpgradeNames(['resilient']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
