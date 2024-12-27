describe('Rugged Survivors', function () {
    integration(function (contextRef) {
        describe('Rugged Survivors\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should draw if you control a deployed leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ruggedSurvivors);
                expect(context.player1).toHavePassAbilityPrompt('Draw a card if you control a leader unit');
                context.player1.clickPrompt('Draw a card if you control a leader unit');

                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.p2Base.damage).toBe(3);
            });
        });

        describe('Rugged Survivors\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rugged-survivors'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not draw if you do not control a deployed leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ruggedSurvivors);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2.hand.length).toBe(0);
            });
        });
    });
});
