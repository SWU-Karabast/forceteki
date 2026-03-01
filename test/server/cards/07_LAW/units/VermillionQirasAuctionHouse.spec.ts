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
            const playRevealedCardPrompt = (title: string, cost: number) => `Play ${title} for free. If you do, your opponent creates ${cost} Credit tokens.`;

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
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.battlefieldMarine.title, 2));
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
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.battlefieldMarine.title, 2));
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
                    expect(context.player2).toHavePassAbilityPrompt(playRevealedCardPrompt(context.battlefieldMarine.title, 2));
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
                    expect(context.player2).toHavePassAbilityPrompt(playRevealedCardPrompt(context.battlefieldMarine.title, 2));
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
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.desperadoFreighter.title, 5));
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
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.desperadoFreighter.title, 5));
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
                    expect(context.player2).toHavePassAbilityPrompt(playRevealedCardPrompt(context.desperadoFreighter.title, 5));
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
                    expect(context.player2).toHavePassAbilityPrompt(playRevealedCardPrompt(context.desperadoFreighter.title, 5));
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
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.battlefieldMarine.title, 2));
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
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.battlefieldMarine.title, 2));
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

                it('the revealed card has cost 0 (Porg), no credits are created', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: ['porg'] // 0 Cost
                        },
                        player2: {
                            deck: ['battlefield-marine']
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose your deck
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Your deck');

                    // Porg is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.porg]);
                    context.player1.clickDone();

                    // Choose yourself to play the card
                    context.player1.clickPrompt('You');

                    // Choose to play Porg for free
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.porg.title, 0));
                    context.player1.clickPrompt('Trigger');

                    // Porg is played, opponent gets 0 credits (no credits created)
                    expect(context.porg).toBeInZone('groundArena', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(0);
                });

                it('nested play a card action (Sneak Attack -> Bossk)', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'the-client#please-lower-your-blaster', // So Bossk is in aspect
                            spaceArena: ['vermillion#qiras-auction-house'],
                            hand: ['bossk#deadly-stalker'], // Costs 2 with Sneak Attack discount
                            resources: 5
                        },
                        player2: {
                            deck: ['sneak-attack'], // 2 Cost event
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose opponent's deck
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Sneak Attack is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.sneakAttack]);
                    context.player1.clickDone();

                    // Choose yourself to play the card
                    context.player1.clickPrompt('You');

                    // Choose to play Sneak Attack for free
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.sneakAttack.title, 2));
                    context.player1.clickPrompt('Trigger');

                    // Sneak Attack prompts to play a unit from hand with cost reduction
                    expect(context.player1).toBeAbleToSelectExactly([context.bossk]);
                    context.player1.clickCard(context.bossk);

                    // Sneak Attack was free, Bossk cost 2 resources, opponent gets 2 credits
                    expect(context.sneakAttack).toBeInZone('discard', context.player2);
                    expect(context.bossk).toBeInZone('groundArena', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(2);
                    expect(context.player2.credits).toBe(2);
                });

                it('revealed card cannot be played by chosen player due to play restrictions (Regional Governor)', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: ['battlefield-marine']
                        },
                        player2: {
                            hand: ['regional-governor'],
                            deck: ['desperado-freighter']
                        }
                    });

                    const { context } = contextRef;

                    // P2 plays Regional Governor and names "Battlefield Marine"
                    context.player1.passAction();
                    context.player2.clickCard(context.regionalGovernor);
                    context.player2.chooseListOption('Battlefield Marine');

                    // P1 attacks with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose your deck
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Your deck');

                    // Battlefield Marine is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                    context.player1.clickDone();

                    // Choose yourself to play the card
                    context.player1.clickPrompt('You');

                    // P1 cannot play Battlefield Marine due to Regional Governor's restriction
                    // The ability automatically skips the play step since it cannot be triggered
                    // Card was not played, stays in deck, no credits created, it is P2's turn
                    expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
                    expect(context.player2.credits).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('revealed upgrade cannot be played by either player because there are no valid targets in play', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            deck: ['the-darksaber'],
                            // No non-vehicle units in play
                            spaceArena: ['vermillion#qiras-auction-house'],
                        },
                        player2: {
                            deck: ['battlefield-marine'],
                            // No non-vehicle units in play
                            spaceArena: ['desperado-freighter']
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose your deck
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Your deck');

                    // The Darksaber is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.theDarksaber]);
                    context.player1.clickDone();

                    // No valid targets for the upgrade, so ability skips the "Choose Player" step
                    // Card was not played, stays in deck, no credits created, it is P2's turn
                    expect(context.theDarksaber).toBeInZone('deck', context.player1);
                    expect(context.player2.credits).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('revealed upgrade with friendly unit restrictions can be played on the chosen player\'s units', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            groundArena: ['battlefield-marine'],
                            deck: ['porg']
                        },
                        player2: {
                            deck: ['darth-mauls-lightsaber'] // 3 Cost upgrade with "friendly unit" restriction
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose opponent's deck
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Darth Maul's Lightsaber is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.darthMaulsLightsaber]);
                    context.player1.clickDone();

                    // Choose yourself to play the card (P1 plays the upgrade from P2's deck)
                    context.player1.clickPrompt('You');

                    // Choose to play the upgrade for free
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.darthMaulsLightsaber.title, 3));
                    context.player1.clickPrompt('Trigger');

                    // Only P1's unit should be a valid target ("friendly" is relative to P1, who is playing the card)
                    expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                    context.player1.clickCard(context.battlefieldMarine);

                    // Upgrade is attached to P1's unit, P2 gets credits for the upgrade's cost
                    expect(context.battlefieldMarine).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(3); // Darth Maul's Lightsaber costs 3
                });

                it('revealed unit with piloting can be played as a unit or an upgrade when there are valid targets in play', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['vermillion#qiras-auction-house'],
                            deck: ['porg']
                        },
                        player2: {
                            deck: ['chewbacca#faithful-first-mate'] // 5 Cost unit with Piloting
                        }
                    });

                    const { context } = contextRef;

                    // Attack with Vermillion
                    context.player1.clickCard(context.vermillion);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers, choose opponent's deck
                    expect(context.player1).toHavePrompt('Reveal the top card of a deck');
                    context.player1.clickPrompt('Opponent\'s deck');

                    // Chewbacca is revealed
                    expect(context.player1).toHaveExactViewableDisplayPromptCards([context.chewbacca]);
                    context.player1.clickDone();

                    // Choose yourself to play the card
                    context.player1.clickPrompt('You');

                    // Choose to play the card for free
                    expect(context.player1).toHavePassAbilityPrompt(playRevealedCardPrompt(context.chewbacca.title, 5));
                    context.player1.clickPrompt('Trigger');

                    // Should see both unit and piloting play options
                    expect(context.player1).toHaveExactPromptButtons(['Play Chewbacca', 'Play Chewbacca with Piloting']);

                    // Play as a pilot upgrade
                    context.player1.clickPrompt('Play Chewbacca with Piloting');

                    // Vermillion is the only valid vehicle target
                    expect(context.player1).toBeAbleToSelectExactly([context.vermillion]);
                    context.player1.clickCard(context.vermillion);

                    // Chewbacca is attached to Vermillion as a pilot, P2 gets credits
                    expect(context.chewbacca).toBeAttachedTo(context.vermillion);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2.credits).toBe(5); // Chewbacca costs 5
                });
            });
        });
    });
});
