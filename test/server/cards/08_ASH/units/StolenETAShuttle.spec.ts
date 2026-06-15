describe('Stolen ETA Shuttle', function () {
    integration(function (contextRef) {
        describe('Stolen ETA Shuttle\'s ability', function () {
            describe('when the player does not have initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['stolen-eta-shuttle'],
                        },
                        player2: {
                            hasInitiative: true
                        },
                    });
                });

                it('should not have +2/+0', function () {
                    const { context } = contextRef;
                    context.player2.passAction();
                    context.player1.clickCard(context.stolenEtaShuttle);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(3);
                });
            });

            describe('when the player has initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['stolen-eta-shuttle'],
                            hasInitiative: true
                        },
                    });
                });

                it('should have +2/+0', function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.stolenEtaShuttle);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(5);
                });
            });
        });
    });
});