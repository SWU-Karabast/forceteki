describe('Open Fire', function() {
    integration(function(contextRef) {
        describe('Open Fire\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', { card: 'fleet-lieutenant', upgrades: ['experience', 'experience'] }],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }]
                    }
                });
            });

            // Base Damage is not allowed and thus is tested in the Select Exactly
            // Similarly this should allow for units behind a sentinal to be selected

            it('can damage a unit with a shield, removing only the shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.fleetLieutenant]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.isUpgraded()).toBe(false);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('spaceArena', context.player2);
            });

            it('can damage a unit without a shield, dealing damage to the unit with health to spare', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.pykeSentinel, context.fleetLieutenant]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);
            });
        });
    });
});