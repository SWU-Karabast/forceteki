describe('Vermillion, Qi\'ra\'s Auction House', () => {
    integration(function(contextRef) {
        describe('When Attack Ends ability', function() {
            it('does nothing if Vermillion is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vermillion#qiras-auction-house'],
                        deck: ['battlefield-marine']
                    },
                    player2: {
                        deck: ['battlefield-marine'],
                        spaceArena: ['devastator#inescapable']
                    }
                });

                const { context } = contextRef;

                // P1 attacks Devastator with Vermillion
                context.player1.clickCard(context.vermillion);
                context.player1.clickCard(context.devastator);

                // Vermillion is defeated, ability does not trigger, it is P2's turn
                expect(context.vermillion).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            const choosePlayerPrompt = (title: string, cost: number) => `Choose a player. That player may play ${title} for free. If they do, the other player creates ${cost} Credit tokens.`;

            describe('Standard Cases', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: ['battlefield-marine'] // 2 Cost
                        },
                        player2: {
                            deck: ['desperado-freighter'] // 5 Cost
                        }
                    });
                });

                it('your deck, choose yourself, play the card, opponent gets tokens', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);
                    context.player1.clickPrompt('Your deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    expect(context.player1).toHaveEnabledPromptButton('Done');
                    context.player1.clickDone();

                    // Choose a player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.battlefieldMarine.title, 2));
                    expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                    context.player1.clickPrompt('You');

                    // Choose to play the card for free
                    expect(context.player1).toHavePassAbilityPrompt(`Play ${context.battlefieldMarine.title} for free`);
                    context.player1.clickPrompt('Trigger');

                    // Card is played for free, opponent gets tokens
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(2);
                });

                it('your deck, choose yourself, don\'t play the card, opponent doesn\'t get credits', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Your deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    context.player1.clickDone();

                    // Choose a player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.battlefieldMarine.title, 2));
                    context.player1.clickPrompt('You');

                    // Choose not to play the card
                    expect(context.player1).toHavePassAbilityPrompt(`Play ${context.battlefieldMarine.title} for free`);
                    context.player1.clickPrompt('Pass');

                    // Card stays in deck, opponent doesn't get credits
                    expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
                    expect(context.player2.credits).toBe(0);
                });

                it('your deck, choose opponent, opponent plays the card, you get credits', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Your deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    context.player1.clickDone();

                    // Choose opponent as the player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.battlefieldMarine.title, 2));
                    context.player1.clickPrompt('Opponent');

                    // Opponent chooses to play the card for free
                    expect(context.player2).toHavePassAbilityPrompt(`Play ${context.battlefieldMarine.title} for free`);
                    context.player2.clickPrompt('Trigger');

                    // Card is played for free under opponent's control, you get credits
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                    expect(context.player2.exhaustedResourceCount).toBe(0);
                    expect(context.player1.credits).toBe(2);
                });

                it('your deck, choose opponent, opponent doesn\'t play the card, you don\'t get credits', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Your deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    context.player1.clickDone();

                    // Choose opponent as the player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.battlefieldMarine.title, 2));
                    context.player1.clickPrompt('Opponent');

                    // Opponent chooses not to play the card
                    expect(context.player2).toHavePassAbilityPrompt(`Play ${context.battlefieldMarine.title} for free`);
                    context.player2.clickPrompt('Pass');

                    // Card stays in deck, you don't get credits
                    expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
                    expect(context.player1.credits).toBe(0);
                });

                it('opponent\'s deck, choose yourself, play the card, opponent gets tokens', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.desperadoFreighter]);
                    context.player1.clickDone();

                    // Choose yourself as the player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.desperadoFreighter.title, 5));
                    context.player1.clickPrompt('You');

                    // Choose to play the card for free
                    expect(context.player1).toHavePassAbilityPrompt(`Play ${context.desperadoFreighter.title} for free`);
                    context.player1.clickPrompt('Trigger');

                    // Card is played for free under your control, opponent gets tokens
                    expect(context.desperadoFreighter).toBeInZone('spaceArena', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(5);
                });

                it('opponent\'s deck, choose yourself, don\'t play the card, opponent doesn\'t get credits', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.desperadoFreighter]);
                    context.player1.clickDone();

                    // Choose yourself as the player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.desperadoFreighter.title, 5));
                    context.player1.clickPrompt('You');

                    // Choose not to play the card
                    expect(context.player1).toHavePassAbilityPrompt(`Play ${context.desperadoFreighter.title} for free`);
                    context.player1.clickPrompt('Pass');

                    // Card stays in opponent's deck, opponent doesn't get credits
                    expect(context.desperadoFreighter).toBeInZone('deck', context.player2);
                    expect(context.player2.credits).toBe(0);
                });

                it('opponent\'s deck, choose opponent, opponent plays the card, you get credits', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.desperadoFreighter]);
                    context.player1.clickDone();

                    // Choose opponent as the player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.desperadoFreighter.title, 5));
                    context.player1.clickPrompt('Opponent');

                    // Opponent chooses to play the card for free
                    expect(context.player2).toHavePassAbilityPrompt(`Play ${context.desperadoFreighter.title} for free`);
                    context.player2.clickPrompt('Trigger');

                    // Card is played for free under opponent's control, you get credits
                    expect(context.desperadoFreighter).toBeInZone('spaceArena', context.player2);
                    expect(context.player2.exhaustedResourceCount).toBe(0);
                    expect(context.player1.credits).toBe(5);
                });

                it('opponent\'s deck, choose opponent, opponent doesn\'t play the card, you don\'t get credits', function() {
                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose a deck to reveal from
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.desperadoFreighter]);
                    context.player1.clickDone();

                    // Choose opponent as the player to play the card
                    expect(context.player1).toHavePrompt(choosePlayerPrompt(context.desperadoFreighter.title, 5));
                    context.player1.clickPrompt('Opponent');

                    // Opponent chooses not to play the card
                    expect(context.player2).toHavePassAbilityPrompt(`Play ${context.desperadoFreighter.title} for free`);
                    context.player2.clickPrompt('Pass');

                    // Card stays in opponent's deck, you don't get credits
                    expect(context.desperadoFreighter).toBeInZone('deck', context.player2);
                    expect(context.player1.credits).toBe(0);
                });
            });

            describe('Special Cases', function() {
                it('player\'s deck is empty, choosing it fizzles the ability', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: []
                        },
                        player2: {
                            deck: ['battlefield-marine']
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, both deck choices are shown
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);

                    // Choose empty deck, ability fizzles
                    context.player1.clickPrompt('Your deck');

                    // No card revealed, it is P2's turn
                    expect(context.player2).toBeActivePlayer();
                });

                it('player\'s deck is empty, choosing opponent\'s deck works normally', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: []
                        },
                        player2: {
                            deck: ['battlefield-marine']
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, both deck choices are shown
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    context.player1.clickDone();

                    // Choose a player to play the card
                    expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                    context.player1.clickPrompt('You');

                    // Choose to play the card for free
                    expect(context.player1).toHavePassAbilityPrompt(`Play ${context.battlefieldMarine.title} for free`);
                    context.player1.clickPrompt('Trigger');

                    // Card is played for free
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(2);
                });

                it('opponent\'s deck is empty, choosing it fizzles the ability', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: ['battlefield-marine']
                        },
                        player2: {
                            deck: []
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, both deck choices are shown
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);

                    // Choose empty deck, ability fizzles
                    context.player1.clickPrompt('Opponent\'s deck');

                    // No card revealed, it is P2's turn
                    expect(context.player2).toBeActivePlayer();
                });

                it('opponent\'s deck is empty, choosing player\'s deck works normally', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: ['battlefield-marine']
                        },
                        player2: {
                            deck: []
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, both deck choices are shown
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);
                    context.player1.clickPrompt('Your deck');

                    // Card is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    context.player1.clickDone();

                    // Choose a player to play the card
                    expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                    context.player1.clickPrompt('You');

                    // Choose to play the card for free
                    expect(context.player1).toHavePassAbilityPrompt(`Play ${context.battlefieldMarine.title} for free`);
                    context.player1.clickPrompt('Trigger');

                    // Card is played for free
                    expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(2);
                });

                it('both decks are empty, ability does not trigger', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: []
                        },
                        player2: {
                            deck: []
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Both decks are empty, no valid choices exist, ability does not trigger, it is P2's turn
                    expect(context.player2).toBeActivePlayer();
                });

                xit('the revealed card has cost 0 (Porg)', async function() {});

                xit('nested play a card action (Sneak Attack -> Bossk)', async function() {});

                xit('revealed card cannot be played by chosen player due to play restrictions (Regional Governor)', async function() {});

                xit('revealed upgrade cannot be played because there are no valid targets in play', async function() {});

                xit('revealed upgrade with friendly unit restrictions can be played on the chosen player\'s units', async function() {});
            });
        });
    });
});
