describe('Vambrace Grappleshot', function() {
    integration(function(contextRef) {
        describe('Vambrace Grappleshot\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['vambrace-grappleshot'] }],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should exhaust the defender on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.snowspeeder);

                expect(context.snowspeeder.damage).toBe(5);
                expect(context.battlefieldMarine.damage).toBe(3);
                expect(context.snowspeeder.exhausted).toBe(true);
            });

            it('should not have any effect after being removed', function () {
                const { context } = contextRef;

                context.vambraceGrappleshot.unattach();
                context.player1.moveCard(context.vambraceGrappleshot, 'discard');

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.snowspeeder);

                expect(context.snowspeeder.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.snowspeeder.exhausted).toBe(false);
            });
        });

        describe('Vambrace Grappleshot', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vambrace-grappleshot'],
                        groundArena: ['snowspeeder', 'battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not be playable on vehicles', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vambraceGrappleshot);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['vambrace-grappleshot']);
            });
        });
    });
});
