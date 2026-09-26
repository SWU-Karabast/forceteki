describe('Gungi, Fighting for Kashyyyk', function () {
    integration(function (contextRef) {
        describe('Actions that should trigger the ability', function () {
            describe('Player does discard a card', function () {
                it('should be able to discard and ready when Gungi is dealt damage and survives', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['daring-raid', 'wampa'],
                            groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }]
                        }
                    });
                    const { context } = contextRef;

                    context.player1.clickCard(context.daringRaid);
                    context.player1.clickCard(context.gungi);

                    expect(context.player1).toHavePrompt('Discard a card from your hand to ready this unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.wampa);
                    context.player1.clickCard(context.wampa);

                    expect(context.gungi.damage).toBe(2);
                    expect(context.gungi.exhausted).toBeFalse();
                    expect(context.wampa).toBeInZone('discard');
                    expect(context.player1.hand.length).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should be able to discard and ready when Gungi is dealt combat damage and survives', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['wampa'],
                            groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }]
                        },
                        player2: {
                            groundArena: ['hunting-nexu'],
                            hasInitiative: true
                        }
                    });
                    const { context } = contextRef;

                    context.player2.clickCard(context.huntingNexu);
                    context.player2.clickCard(context.gungi);

                    expect(context.player1).toHavePrompt('Discard a card from your hand to ready this unit');
                    expect(context.player1).toBeAbleToSelectExactly(context.wampa);
                    context.player1.clickCard(context.wampa);

                    expect(context.gungi.damage).toBe(4);
                    expect(context.gungi.exhausted).toBeFalse();
                    expect(context.wampa).toBeInZone('discard');
                    expect(context.player1.hand.length).toBe(0);
                    expect(context.player1).toBeActivePlayer();
                });
            });

            describe('Player doesn\'t discard a card', function () {
                it('should be able to pass the ability when Gungi is dealt damage and survives', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['daring-raid', 'wampa'],
                            groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }]
                        }
                    });
                    const { context } = contextRef;

                    context.player1.clickCard(context.daringRaid);
                    context.player1.clickCard(context.gungi);

                    expect(context.player1).toHavePrompt('Discard a card from your hand to ready this unit');
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.passAction();

                    expect(context.gungi.damage).toBe(2);
                    expect(context.gungi.exhausted).toBeTrue();
                    expect(context.wampa).not.toBeInZone('discard');
                    expect(context.player1.hand.length).toBe(1);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should be able to pass the ability when Gungi is dealt combat damage and survives', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['wampa'],
                            groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }]
                        },
                        player2: {
                            groundArena: ['hunting-nexu'],
                            hasInitiative: true
                        }
                    });
                    const { context } = contextRef;

                    context.player2.clickCard(context.huntingNexu);
                    context.player2.clickCard(context.gungi);

                    expect(context.player1).toHavePrompt('Discard a card from your hand to ready this unit');
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.passAction();

                    expect(context.gungi.damage).toBe(4);
                    expect(context.gungi.exhausted).toBeTrue();
                    expect(context.wampa).not.toBeInZone('discard');
                    expect(context.player1.hand.length).toBe(1);
                    expect(context.player1).toBeActivePlayer();
                });
            });
        });

        describe('Actions that should trigger the ability', function () {
            it('should not trigger ability if friendly unit is damaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }, {
                            card: 'wampa',
                            exhausted: true
                        }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.player1).not.toHavePrompt('Discard a card from your hand to ready this unit');

                expect(context.wampa.damage).toBe(2);
                expect(context.gungi.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger if Gungi is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle'],
                        hasInitiative: true
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.dinosaurTurtle);
                context.player2.clickCard(context.gungi);

                expect(context.player1).not.toHavePrompt('Discard a card from your hand to ready this unit');

                expect(context.gungi).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger when an enemy unit is dealt damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: [{ card: 'gungi#fighting-for-kashyyyk', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.player1).not.toHavePrompt('Discard a card from your hand to ready this unit');

                expect(context.wampa.damage).toBe(2);
                expect(context.gungi.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});