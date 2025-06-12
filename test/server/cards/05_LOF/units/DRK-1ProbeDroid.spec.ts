describe('DRK-1 Probe Droid', function() {
    integration(function(contextRef) {
        describe('DRK-1 Probe Droid\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['drk1-probe-droid'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['frozen-in-carbonite'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['lukes-lightsaber'] }, { card: 'battlefield-marine', upgrades: ['generals-blade'] }],
                    }
                });
            });

            it('can defeat a non-unique upgrade on a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.drk1ProbeDroid);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.generalsBlade]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.frozenInCarbonite);
                expect(context.pykeSentinel.isUpgraded()).toBe(false);
                expect(context.lukeSkywalkerJediKnight.isUpgraded()).toBe(true);
                expect(context.frozenInCarbonite).toBeInZone('discard');
            });

            it('can defeat a non-unique upgrade on an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.drk1ProbeDroid);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.generalsBlade]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.generalsBlade);
                expect(context.battlefieldMarine.isUpgraded()).toBe(false);
                expect(context.lukeSkywalkerJediKnight.isUpgraded()).toBe(true);
                expect(context.generalsBlade).toBeInZone('discard');
            });
        });
    });
});