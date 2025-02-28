describe('Steadfast Battalion', function () {
    integration(function (contextRef) {
        describe('Steadfast Battalion\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give a unit +2/+2 if you control a leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(5);

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                // steadfast battalion: 5 + battlefieldMarine: 3+2 = 10
                expect(context.p2Base.damage).toBe(10);
            });
        });

        describe('Steadfast Battalion\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not give a unit +2/+2 if you do not control a leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.steadfastBattalion);
                expect(context.battlefieldMarine.getPower()).toBe(3);

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                // steadfast battalion: 5 + battlefieldMarine: 3 = 8
                expect(context.p2Base.damage).toBe(8);
            });
        });
    });
});
