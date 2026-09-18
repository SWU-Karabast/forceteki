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

                // Play the Fortify upgrade
                context.player1.clickCard(context.allianceShieldGenerator);

                // The controller's own base is the only legal attach target
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickCard(context.p1Base);

                // Upgrade is attached to the base
                expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
                expect(context.allianceShieldGenerator).toBeInZone('base', context.player1);
                expect(context.p1Base).toHaveExactUpgradeNames(['alliance-shield-generator']);
                expect(context.player2).toBeActivePlayer();

                // The base upgrade is serialized to the client nested on the base summary
                expect(context.p1Base.getSummary(context.player1Object).upgrades.length).toBe(1);
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

                // Attach the Fortify upgrade to the base
                context.player1.clickCard(context.allianceShieldGenerator);
                context.player1.clickCard(context.p1Base);
                expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);

                // Defeat the base upgrade like any other upgrade
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.allianceShieldGenerator);

                // Upgrade is discarded and no longer attached to the base
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

                // Play the non-Fortify upgrade
                context.player1.clickCard(context.foundling);

                // Only units are legal targets - neither base is selectable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickPrompt('Cancel');
            });
        });

        describe('Test setup handling of base upgrades', function() {
            it('can place a Fortify upgrade already attached to a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'echo-base', upgrades: ['alliance-shield-generator'] },
                    }
                });

                const { context } = contextRef;

                expect(context.allianceShieldGenerator).toBeAttachedTo(context.p1Base);
                expect(context.allianceShieldGenerator).toBeInZone('base', context.player1);
                expect(context.p1Base).toHaveExactUpgradeNames(['alliance-shield-generator']);
            });

            it('throws if a non-Fortify upgrade is placed on a base', async function () {
                await expectAsync(contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'echo-base', upgrades: ['foundling'] },
                    }
                })).toBeRejectedWithError('Attempting to attach upgrade \'foundling\' to a base, but it does not have the Fortify keyword');
            });

            it('throws if a Fortify upgrade is placed on a unit', async function () {
                await expectAsync(contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['alliance-shield-generator'] }],
                    }
                })).toBeRejectedWithError('Attempting to attach Fortify upgrade \'alliance-shield-generator\' to non-base card \'wampa\'');
            });
        });
    });
});
