describe('Senator\'s Aide', function () {
    integration(function (contextRef) {
        describe('Senator\'s Aide\'s ability', function () {
            describe('when the player does not have initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['senators-aide'],
                        },
                        player2: {
                            hasInitiative: true
                        },
                    });
                });

                it('should not have +2/+0', function () {
                    const { context } = contextRef;
                    context.player2.passAction();
                    context.player1.clickCard(context.senatorsAide);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(0);
                });
            });

            describe('when the player has initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['senators-aide'],
                            hasInitiative: true
                        },
                    });
                });

                it('should have +2/+0', function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.senatorsAide);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(2);
                });
            });
        });
    });
});