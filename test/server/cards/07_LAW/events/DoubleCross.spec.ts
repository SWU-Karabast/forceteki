describe('Double-Cross', function() {
    integration(function(contextRef) {
        describe('Double-Cross\'s event ability', function() {
            it('does nothing when there are no enemy non-leader units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doublecross'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doublecross);
                context.player1.clickPrompt('Play anyway');

                expect(context.doublecross).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.controller).toBe(context.player1Object);
            });

            it('does nothing when there are no friendly non-leader units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doublecross'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doublecross);
                context.player1.clickPrompt('Play anyway');

                expect(context.doublecross).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.controller).toBe(context.player2Object);
            });

            describe('when there are friendly and enemy non-leader units in play', function() {
                beforeEach(function() {
                    return contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['doublecross'],
                            groundArena: ['battlefield-marine', 'wampa'], // cost 2, cost 4
                            spaceArena: [],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: ['atst', 'loan-shark'], // cost 6, cost 4
                            spaceArena: ['cartel-spacer'], // cost 2
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('only allows non-leaders to be selected and exchanges control and gives credits to opponent when friendly unit costs less', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.doublecross);
                    expect(context.player1).toHavePrompt('Choose a friendly non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toHavePrompt('Choose an enemy non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly([context.atst, context.loanShark, context.cartelSpacer]);

                    context.player1.clickCard(context.atst);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.battlefieldMarine.controller).toBe(context.player2Object);
                    expect(context.atst.controller).toBe(context.player1Object);

                    // AT costs 6, Marine costs 2
                    expect(context.player1.credits).toBe(0);
                    expect(context.player2.credits).toBe(4);
                });

                it('allows units from different arenas to be selected and exchanges control and gives credits to player when enemy unit costs less', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.doublecross);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.cartelSpacer);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.wampa.controller).toBe(context.player2Object);
                    expect(context.cartelSpacer.controller).toBe(context.player1Object);

                    // Wampa cost 4, Spacer cost 2
                    expect(context.player1.credits).toBe(2);
                    expect(context.player2.credits).toBe(0);
                });

                it('exchanges control and gives no credits when units have equal cost', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.doublecross);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.loanShark);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.wampa.controller).toBe(context.player2Object);
                    expect(context.loanShark.controller).toBe(context.player1Object);

                    // Both cost 4
                    expect(context.player1.credits).toBe(0);
                    expect(context.player2.credits).toBe(0);
                });
            });
        });
    });
});