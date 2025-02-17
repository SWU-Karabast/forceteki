describe('Ardent Sympathizer', function () {
    integration(function (contextRef) {
        describe('Ardent Sympathizer\'s ability', function () {
            describe('when the player does not have initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['ardent-sympathizer'],
                        },
                        player2: {
                            hasInitiative: true
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });
                });

                it('should not have +2/+0', function () {
                    const { context } = contextRef;
                    context.player2.passAction();
                    context.player1.clickCard(context.ardentSympathizer);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(3);
                });
            });

            describe('when the player has initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['ardent-sympathizer'],
                            hasInitiative: true
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });
                });

                it('should have +2/+0', function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.ardentSympathizer);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(5);
                });
            });
        });
    });
});
