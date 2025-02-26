describe('Choose Sides', function() {
    integration(function(contextRef) {
        describe('Choose Sides\'s event ability', function() {
            describe('when there are no enemy non-leader units in play', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['choose-sides'],
                            groundArena: ['echo#restored'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('does nothing', () => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.chooseSides);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.echo.controller).toBe(context.player1Object);
                });
            });

            describe('when there are no friendly non-leader units in play', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['choose-sides'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: ['echo#restored'],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('does nothing', () => {
                    const { context } = contextRef;

                    context.player1.clickCard(context.chooseSides);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.echo.controller).toBe(context.player2Object);
                });
            });

            describe('when there are friendly and enemy non-leader units in play', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['choose-sides'],
                            groundArena: ['echo#restored'],
                            spaceArena: ['cartel-spacer'],
                            leader: { card: 'boba-fett#daimyo', deployed: true },
                        },
                        player2: {
                            groundArena: ['echo#restored'],
                            spaceArena: ['wing-leader'],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        }
                    });
                });

                it('exchanges control of a friendly and enemy non-leader unit', () => {
                    const { context } = contextRef;

                    context.p1Echo = context.player1.findCardByName('echo#restored');
                    context.p2Echo = context.player2.findCardByName('echo#restored');

                    context.player1.clickCard(context.chooseSides);
                    expect(context.player1).toHavePrompt('Choose a friendly non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly([context.p1Echo, context.cartelSpacer]);

                    context.player1.clickCard(context.p1Echo);
                    expect(context.player1).toHavePrompt('Choose an enemy non-leader unit');
                    expect(context.player1).toBeAbleToSelectExactly([context.p2Echo, context.wingLeader]);

                    context.player1.clickCard(context.p2Echo);

                    expect(context.player2).toBeActivePlayer();
                    expect(context.p1Echo.controller).toBe(context.player2Object);
                    expect(context.p2Echo.controller).toBe(context.player1Object);
                });
            });
        });
    });
});
