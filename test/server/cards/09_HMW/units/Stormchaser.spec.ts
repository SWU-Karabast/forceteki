describe('Stormchaser', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            const revealPrompt = 'Reveal a Disaster card from your hand';

            describe('when there is a Disaster card in hand but not in discard', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['stormchaser', 'sandstorm'],
                            deck: ['wampa']
                        }
                    });
                });

                it('should not draw a card if the player declines to reveal', function() {
                    const { context } = contextRef;

                    // Play Stormchaser
                    context.player1.clickCard(context.stormchaser);

                    // Ability triggers, prompts to reveal a Disaster card from hand
                    expect(context.player1).toHavePrompt(revealPrompt);
                    expect(context.player1).toBeAbleToSelectExactly([context.sandstorm]);
                    expect(context.player1).toHaveChooseNothingButton();

                    // Decline to reveal
                    context.player1.clickPrompt('Choose nothing');

                    // No card revealed, no card drawn
                    expect(context.sandstorm).toBeInZone('hand', context.player1);
                    expect(context.wampa).toBeInZone('deck', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should draw a card if the player reveals the Disaster card', function() {
                    const { context } = contextRef;

                    // Play Stormchaser
                    context.player1.clickCard(context.stormchaser);

                    // Ability triggers, prompts to reveal a Disaster card from hand
                    expect(context.player1).toHavePrompt(revealPrompt);
                    expect(context.player1).toBeAbleToSelectExactly([context.sandstorm]);

                    // Reveal the Disaster card
                    context.player1.clickCard(context.sandstorm);

                    // Card is revealed to the opponent
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.sandstorm]);
                    expect(context.player2).toHaveEnabledPromptButton('Done');
                    context.player2.clickDone();

                    // Card is drawn, revealed card stays in hand
                    expect(context.wampa).toBeInZone('hand', context.player1);
                    expect(context.sandstorm).toBeInZone('hand', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should draw a card unconditionally, with no reveal prompt, if there is a Disaster card in discard but none in hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stormchaser'],
                        discard: ['sandstorm'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Stormchaser
                context.player1.clickCard(context.stormchaser);

                // No reveal prompt is presented since there's no Disaster card in hand
                // The draw resolves automatically from the discard pile condition
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.sandstorm).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            describe('when there is a Disaster card in both hand and discard', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['stormchaser', 'sandstorm'],
                            discard: ['nightfall'],
                            deck: ['wampa', 'porg']
                        }
                    });
                });

                it('should draw a card if the player reveals the Disaster card from hand', function() {
                    const { context } = contextRef;

                    // Play Stormchaser
                    context.player1.clickCard(context.stormchaser);

                    // Ability triggers, prompts to reveal a Disaster card from hand
                    expect(context.player1).toHavePrompt(revealPrompt);
                    expect(context.player1).toBeAbleToSelectExactly([context.sandstorm]);

                    // Reveal the Disaster card from hand
                    context.player1.clickCard(context.sandstorm);

                    // Card is revealed to the opponent
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.sandstorm]);
                    context.player2.clickDone();

                    // Card is drawn
                    expect(context.wampa).toBeInZone('hand', context.player1);
                    expect(context.porg).toBeInZone('deck', context.player1); // Only one card drawn, so the other card remains in deck
                    expect(context.sandstorm).toBeInZone('hand', context.player1);
                    expect(context.nightfall).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should still draw a card via the discard condition if the player declines to reveal', function() {
                    const { context } = contextRef;

                    // Play Stormchaser
                    context.player1.clickCard(context.stormchaser);

                    // Ability triggers, prompts to reveal a Disaster card from hand
                    expect(context.player1).toHavePrompt(revealPrompt);
                    expect(context.player1).toBeAbleToSelectExactly([context.sandstorm]);
                    expect(context.player1).toHaveChooseNothingButton();

                    // Decline to reveal
                    context.player1.clickPrompt('Choose nothing');

                    // No card was revealed, but the discard pile condition still triggers the draw
                    expect(context.wampa).toBeInZone('hand', context.player1);
                    expect(context.sandstorm).toBeInZone('hand', context.player1);
                    expect(context.nightfall).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should not draw a card and present no reveal prompt if there is no Disaster card in hand or discard', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stormchaser'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Stormchaser
                context.player1.clickCard(context.stormchaser);

                // No eligible Disaster card anywhere, so no reveal prompt and no draw
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
