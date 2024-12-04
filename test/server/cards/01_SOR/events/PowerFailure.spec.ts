describe('Power Failure', function() {
    integration(function(contextRef) {
        describe('Power Failure\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['power-failure'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['entrenched', 'devotion'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training', 'shield'] }]
                    }
                });
            });

            it('defeats all upgrades on a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerFailure);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.imperialInterceptor]);

                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.entrenched);
                context.player1.clickPrompt('Done');

                expect(context.pykeSentinel.isUpgraded()).toBe(false);
                expect(context.imperialInterceptor.isUpgraded()).toBe(true);
                expect(context.entrenched).toBeInZone('discard');
                expect(context.devotion).toBeInZone('discard');
            });

            it('defeats selected upgrades on a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerFailure);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.imperialInterceptor]);

                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.shield);
                context.player1.clickPrompt('Done');

                expect(context.imperialInterceptor).toHaveExactUpgradeNames(['academy-training']);
            });
        });
    });
});