describe('Razor Crew, Reliable Gunship', function () {
    integration(function (contextRef) {
        describe('Razor Crew\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['razor-crest#reliable-gunship'],
                        discard: ['keep-fighting', 'electrostaff', 'academy-training']
                    },
                    player2: {
                        discard: ['entrenched']
                    }
                });
            });

            it('should return an upgrade to hand from your discard pile', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.razorCrest);
                expect(context.player1).toBeAbleToSelectExactly([context.electrostaff, context.academyTraining]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.electrostaff);
                expect(context.player1.hand.length).toBe(1);
                expect(context.electrostaff.location).toBe('hand');
            });
        });
    });
});
