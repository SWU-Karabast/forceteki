describe('Impropriety Among Thieves', function () {
    integration(function (contextRef) {
        describe('Impropriety Among Thieves\'s event ability', function () {
            describe('when there are no ready non-leader units in play', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves'],
                            groundArena: ['superlaser-technician'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: ['seasoned-shoretrooper'],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('does nothing', () => {
                    const { context } = contextRef;
                    context.superlaserTechnician.exhaust();
                    context.seasonedShoretrooper.exhaust();

                    context.player1.clickCard(context.improprietyAmongThieves);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician.controller).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper.controller).toBeInZone('groundArena', context.player2);
                });
            });

            describe('when there are ready non-leader units in play', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['impropriety-among-thieves'],
                            groundArena: ['superlaser-technician'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: ['seasoned-shoretrooper', 'scanning-officer'],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('exchanges control of the chosen units and returns control at the start of the regroup phase', () => {
                    const { context } = contextRef;
                    context.scanningOfficer.exhaust();

                    context.player1.clickCard(context.improprietyAmongThieves);
                    expect(context.player1).toHavePrompt('Choose a ready friendly non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.superlaserTechnician);

                    context.player1.clickCard(context.superlaserTechnician);
                    expect(context.player1).toHavePrompt('Choose a ready enemy non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.seasonedShoretrooper);

                    context.player1.clickCard(context.seasonedShoretrooper);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player1);

                    context.moveToRegroupPhase();

                    expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
                    expect(context.seasonedShoretrooper).toBeInZone('groundArena', context.player2);
                });
            });
        });
    });
});
