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
                    expect(context.getChatLogs(2)).toEqual([
                        'player1 plays Double-Cross to give control of Battlefield Marine to player2 and to take control of AT-ST',
                        'player1 uses Double-Cross to make player2 create 4 Credit tokens',
                    ]);
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
                    expect(context.getChatLogs(2)).toEqual([
                        'player1 plays Double-Cross to give control of Wampa to player2 and to take control of Cartel Spacer',
                        'player1 uses Double-Cross to create 2 Credit tokens',
                    ]);
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
                    expect(context.getChatLog()).toEqual(
                        'player1 plays Double-Cross to give control of Wampa to player2 and to take control of Loan Shark'
                    );
                });
            });

            it('exchanges control of only one unit when Rey is the other one, selecting higher cost card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doublecross'],
                        groundArena: ['battlefield-marine', 'wampa', 'rey#skywalker'], // cost 2, cost 4, cost 8
                        spaceArena: [],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        groundArena: ['atst', 'loan-shark'], // cost 6, cost 4
                        spaceArena: ['cartel-spacer', 'devastator#inescapable'], // cost 2, cost 10
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doublecross);
                context.player1.clickCard(context.rey);
                context.player1.clickCard(context.devastator);

                expect(context.player2).toBeActivePlayer();
                expect(context.rey.controller).toBe(context.player1Object);
                expect(context.devastator.controller).toBe(context.player1Object);
                expect(context.player1.credits).toBe(2);
                expect(context.player2.credits).toBe(0);
                expect(context.getChatLogs(3)).toEqual([
                    'player1 plays Double-Cross to give control of Rey to player2 and to take control of Devastator',
                    'player2 uses Rey to cancel the effects of Double-Cross',
                    'player1 uses Double-Cross to create 2 Credit tokens',
                ]);
            });

            it('exchanges control of only one unit when Rey is the other one, selecting lower cost card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doublecross'],
                        groundArena: ['battlefield-marine', 'wampa', 'rey#skywalker'], // cost 2, cost 4, cost 8
                        spaceArena: [],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        groundArena: ['atst', 'loan-shark'], // cost 6, cost 4
                        spaceArena: ['cartel-spacer', 'devastator#inescapable'], // cost 2, cost 10
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doublecross);
                context.player1.clickCard(context.rey);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player2).toBeActivePlayer();
                expect(context.rey.controller).toBe(context.player1Object);
                expect(context.cartelSpacer.controller).toBe(context.player1Object);
                expect(context.player1.credits).toBe(6);
                expect(context.player2.credits).toBe(0);
            });

            it('gives credits to the correct player when the lower cost exchanged unit is defeated by unique rule', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doublecross'],
                        groundArena: ['jyn-erso#take-the-next-chance'], // cost 2
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'jyn-erso#take-the-next-chance'], // cost 5, cost 2
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                const p1JynErso = context.player1.findCardByName('jyn-erso#take-the-next-chance');

                context.player1.clickCard(context.doublecross);

                // Give Jyn Erso (cost 2) to opponent, take Rugged Survivors (cost 5)
                context.player1.clickCard(p1JynErso);
                context.player1.clickCard(context.ruggedSurvivors);

                // Unique rule triggers: opponent now has two Jyn Ersos, must defeat one
                expect(context.player2).toHavePrompt('Choose which copy of Jyn Erso, Take the Next Chance to defeat');
                context.player2.clickCard(p1JynErso);
                expect(p1JynErso).toBeInZone('discard');

                // Rugged Survivors (cost 5) is now controlled by player1, Jyn Erso (cost 2) was given to player2
                // Player2 received the lower-cost unit, so player2 should get 2 credits
                expect(context.ruggedSurvivors.controller).toBe(context.player1Object);
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(3);
            });

            it('gives credits to the correct player when the higher cost exchanged unit is defeated by unique rule', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['doublecross'],
                        groundArena: ['poe-dameron#quick-to-improvise'], // cost 5
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise', 'jyn-erso#take-the-next-chance'], // cost 5, cost 2
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                const p1Poe = context.player1.findCardByName('poe-dameron#quick-to-improvise');

                context.player1.clickCard(context.doublecross);

                // Give Poe Dameron (cost 5) to opponent, take Jyn Erso (cost 2)
                context.player1.clickCard(p1Poe);
                context.player1.clickCard(context.jynErso);

                // Unique rule triggers: opponent now has two Poes, must defeat one
                expect(context.player2).toHavePrompt('Choose which copy of Poe Dameron, Quick to Improvise to defeat');
                context.player2.clickCard(p1Poe);
                expect(p1Poe).toBeInZone('discard');

                // Jyn Erso (cost 2) is now controlled by player1, Poe Dameron (cost 5) was given to player2
                // Player1 received the lower-cost unit, so player1 should get 2 credits
                expect(context.jynErso.controller).toBe(context.player1Object);
                expect(context.player1.credits).toBe(3);
                expect(context.player2.credits).toBe(0);
            });
        });
    });
});