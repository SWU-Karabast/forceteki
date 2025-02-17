describe('Warbird Stowaway', function () {
    integration(function (contextRef) {
        describe('Warbird Stowaway\'s ability', function () {
            describe('when the player does not have initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['warbird-stowaway'],
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
                    context.player1.clickCard(context.warbirdStowaway);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(2);
                });
            });

            describe('when the player has initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['warbird-stowaway'],
                            hasInitiative: true
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });
                });

                it('should have +2/+0', function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.warbirdStowaway);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(4);
                });
            });
        });
    });
});
