describe('Fortify keyword', function() {
    integration(function(contextRef) {
        describe('An upgrade with the Fortify keyword', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-shield-generator'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });
            });

            it('can be played and attached to its controller\'s own base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceShieldGenerator);

                // The controller's own base is the only legal attach target
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
                expect(context.allianceShieldGenerator).toBeInZone('base', context.player1);
                expect(context.p1Base).toHaveExactUpgradeNames(['alliance-shield-generator']);
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot be attached to the enemy base or to a friendly or enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceShieldGenerator);

                // Fortify overrides the default "attach to a unit" restriction and only allows the
                // controller's own base - never the enemy base (p2Base) or any unit (wampa / battlefieldMarine)
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickPrompt('Cancel');
            });
        });

        describe('An upgrade attached to a base', function() {
            it('can be defeated and removed from the base like any other upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-shield-generator'],
                    },
                    player2: {
                        hand: ['confiscate'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.allianceShieldGenerator);
                context.player1.clickCard(context.p1Base);
                expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.allianceShieldGenerator);

                expect(context.allianceShieldGenerator).toBeInZone('discard', context.player1);
                expect(context.p1Base.upgrades).toEqual([]);
            });
        });

        describe('An upgrade without the Fortify keyword', function() {
            it('can only be attached to a unit, never to a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['foundling'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.foundling);

                // Only units are legal targets - neither base is selectable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickPrompt('Cancel');
            });
        });
    });
});
