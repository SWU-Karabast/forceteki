describe('Disabling Fang Fighter', function() {
    integration(function(contextRef) {
        describe('Disabling Fang Fighter\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['disabling-fang-fighter'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['frozen-in-carbonite'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['lukes-lightsaber'] }],
                    }
                });
            });

            it('can defeat an upgrade on a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disablingFangFighter);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.lukesLightsaber]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.frozenInCarbonite);
                expect(context.pykeSentinel.isUpgraded()).toBe(false);
                expect(context.lukeSkywalkerJediKnight.isUpgraded()).toBe(true);
                expect(context.frozenInCarbonite).toBeInZone('discard');
            });

            it('can defeat an upgrade on a enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disablingFangFighter);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.lukesLightsaber]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.lukesLightsaber);
                expect(context.pykeSentinel.isUpgraded()).toBe(true);
                expect(context.lukeSkywalkerJediKnight.isUpgraded()).toBe(false);
                expect(context.lukesLightsaber).toBeInZone('discard');
            });

            it('can pass on defeating an upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disablingFangFighter);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.lukesLightsaber]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass ability');
                expect(context.pykeSentinel.isUpgraded()).toBe(true);
                expect(context.lukeSkywalkerJediKnight.isUpgraded()).toBe(true);
                expect(context.frozenInCarbonite).toBeInZone('groundArena');
                expect(context.lukesLightsaber).toBeInZone('groundArena');
            });
        });
    });
});