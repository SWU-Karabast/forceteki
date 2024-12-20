describe('Confederate Courier\'s ability', function () {
    integration(function (contextRef) {
        it('should exhaust targeted unit when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['perilous-position'],
                    groundArena: ['outspoken-representative']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.perilousPosition);
            expect(context.player1).toBeAbleToSelectExactly([context.outspokenRepresentative]);
            context.player1.clickCard(context.outspokenRepresentative);
            expect(context.outspokenRepresentative.exhausted).toBeTrue();
        });
    });
});