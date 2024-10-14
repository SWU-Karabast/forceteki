describe('Confiscate', function() {
    integration(function(contextRef) {
        describe('Confiscate\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['entrenched'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }]
                    }
                });
            });

            it('can defeat an upgrade on a friendly or enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.confiscate);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.academyTraining]);

                context.player1.clickCard(context.academyTraining);
                expect(context.imperialInterceptor.isUpgraded()).toBe(false);
                expect(context.academyTraining).toBeInLocation('discard');
            });
        });

        describe('Confiscate\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate', 'entrenched'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('when played on a friendly upgrade attached to an enemy unit will cause the upgrade to be in friendly discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.entrenched);
                // card attaches automatically as there's only one target

                context.player2.passAction();

                context.player1.clickCard(context.confiscate);
                expect(context.wampa.isUpgraded()).toBe(false);

                // this expectation will automatically check that entrenched is in the owning player's discard
                expect(context.entrenched).toBeInLocation('discard', context.player1);
            });
        });
    });
});
