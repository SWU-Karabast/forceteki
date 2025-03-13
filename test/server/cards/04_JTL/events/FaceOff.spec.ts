describe('FaceOff', function () {
    integration(function (contextRef) {
        describe('FaceOff\'s event ability', function () {
            describe('when no player has taken the initiative this phase', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['face-off'],
                            groundArena: [{ card: 'superlaser-technician', exhausted: true }],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: [{ card: 'seasoned-shoretrooper', exhausted: true }],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('readies an enemy unit and then readies a friendly unit in the same arena', () => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.faceOff);
                    expect(context.player1).toHavePrompt('Choose an enemy unit to ready');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);

                    context.player1.clickCard(context.seasonedShoretrooper);
                    expect(context.seasonedShoretrooper.exhausted).toBe(false);

                    expect(context.player1).toHavePrompt('Ready a friendly unit in the same arena');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);

                    context.player1.clickCard(context.superlaserTechnician);
                    expect(context.superlaserTechnician.exhausted).toBe(false);
                });
            });
        });

        describe('FaceOff\'s event ability', function () {
            describe('when no player has taken the initiative this phase', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['face-off'],
                            spaceArena: [{ card: 'wing-leader', exhausted: true }],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: [{ card: 'seasoned-shoretrooper', exhausted: true }],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('does not ready friendly unit in different arena', () => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.faceOff);
                    expect(context.player1).toHavePrompt('Choose an enemy unit to ready');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);

                    context.player1.clickCard(context.seasonedShoretrooper);
                    expect(context.seasonedShoretrooper.exhausted).toBe(false);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.wingLeader.exhausted).toBe(true);
                });
            });
        });

        describe('when a player has taken the initiative this phase', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'seasoned-shoretrooper', exhausted: true }],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    },
                    player2: {
                        hand: ['face-off'],
                        groundArena: [{ card: 'superlaser-technician', exhausted: true }],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                });
            });

            it('does nothing', () => {
                const { context } = contextRef;

                context.player1.claimInitiative();
                context.player2.clickCard(context.faceOff);
                context.player2.clickPrompt('Trigger');
                expect(context.player2).not.toHavePrompt('Choose an enemy unit to ready');
                expect(context.superlaserTechnician.exhausted).toBe(true);
                expect(context.seasonedShoretrooper.exhausted).toBe(true);
            });
        });
    });
});