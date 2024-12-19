describe('Confederate Courier', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['perilous-position'],
                        groundArena: ['outspoken-representative']
                    },
                    player2: {
                        groundArena: [{ card: 'duchesss-champion', exhausted: true }]
                    },
                });
            });

            it('targeted unit should be exhausted when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.perilousPosition);
                expect(context.player1).toBeAbleToSelectExactly([context.outspokenRepresentative, context.duchesssChampion]);
                context.player1.clickCard(context.outspokenRepresentative);
                expect(context.outspokenRepresentative.exhausted).toBeTrue();
            });

            it('targeting exhausted unit should still be exhausted when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.perilousPosition);
                expect(context.player1).toBeAbleToSelectExactly([context.outspokenRepresentative, context.duchesssChampion]);
                context.player1.clickCard(context.duchesssChampion);
                expect(context.duchesssChampion.exhausted).toBeTrue();
            });
        });
    });
});