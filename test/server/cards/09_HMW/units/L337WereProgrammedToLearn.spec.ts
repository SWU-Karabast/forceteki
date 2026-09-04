describe('L3-37: We\'re Programmed To Learn', function() {
    integration(function(contextRef) {
        describe('its triggered ability', function() {
            const replayPrompt = (title: string) => `Play ${title} again from your discard pile for free`;

            describe('when a cheap event is played', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['daring-raid'],
                            groundArena: ['l337#were-programmed-to-learn']
                        }
                    });
                });

                it('should let the controller replay the event from discard for free', function() {
                    const { context } = contextRef;

                    // Play Daring Raid, dealing 2 damage to the base
                    context.player1.clickCard(context.daringRaid);
                    expect(context.player1).toBeAbleToSelectExactly([context.l337, context.p1Base, context.p2Base]);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(2);
                    const exhaustedResourcesAfterFirstPlay = context.player1.exhaustedResourceCount;

                    // Accept the replay, dealing another 2 damage
                    expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.daringRaid.title));
                    context.player1.clickPrompt('Trigger');
                    expect(context.player1).toBeAbleToSelectExactly([context.l337, context.p1Base, context.p2Base]);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(4);

                    // The replay was free, so no additional resources were exhausted
                    expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourcesAfterFirstPlay);

                    // Event returns to discard after being replayed
                    expect(context.daringRaid).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();

                    // The game log records that the event was replayed from the discard pile
                    expect(context.getChatLogs(3)).toContain('player1 uses L3-37 to play Daring Raid from their discard pile');
                });

                it('should allow the player to decline replaying the event', function() {
                    const { context } = contextRef;

                    // Play Daring Raid
                    context.player1.clickCard(context.daringRaid);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(2);

                    // Decline the replay
                    expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.daringRaid.title));
                    context.player1.clickPrompt('Pass');

                    // No additional damage is dealt, event stays in discard
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.daringRaid).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('the once-per-phase limit', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['daring-raid', 'smugglers-aid'],
                            groundArena: ['l337#were-programmed-to-learn'],
                            base: { card: 'echo-base', damage: 6 }
                        }
                    });
                });

                it('should not be consumed when the player declines the replay', function() {
                    const { context } = contextRef;

                    // Play the first cheap event and decline the replay
                    context.player1.clickCard(context.daringRaid);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.daringRaid.title));
                    context.player1.clickPrompt('Pass');
                    expect(context.player2).toBeActivePlayer();
                    context.player2.passAction();

                    // The replay should still be offered for a second cheap event played later in the phase
                    context.player1.clickCard(context.smugglersAid);
                    expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.smugglersAid.title));
                    context.player1.clickPrompt('Trigger');
                    expect(context.smugglersAid).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();

                    // Smuggler's Aid healed player1's base both times (6 - 3 - 3 = 0)
                    expect(context.p1Base.damage).toBe(0);
                });

                it('should prevent the replay from being offered again this phase after the player accepts once', function() {
                    const { context } = contextRef;

                    // Play the first cheap event and accept the replay, consuming the once-per-phase use
                    context.player1.clickCard(context.daringRaid);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.daringRaid.title));
                    context.player1.clickPrompt('Trigger');
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(4);
                    expect(context.player2).toBeActivePlayer();
                    context.player2.passAction();

                    // No replay is offered for a second cheap event played later in the phase
                    context.player1.clickCard(context.smugglersAid);
                    expect(context.smugglersAid).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();

                    // Smuggler's Aid healed player1's base only once (6 - 3 = 3)
                    expect(context.p1Base.damage).toBe(3);
                });
            });

            it('should not trigger for an event that costs more than 3', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown'],
                        groundArena: ['l337#were-programmed-to-learn']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Takedown to defeat Wampa
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                // No replay is offered
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.takedown).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when the opponent plays a cheap event', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['l337#were-programmed-to-learn']
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 plays the cheap event; L3-37's ability belongs to player 1 and does not trigger
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger for a cheap event that does not end up in the discard pile, and should not consume the once-per-phase use', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['resupply', 'smugglers-aid'],
                        groundArena: ['l337#were-programmed-to-learn']
                    }
                });

                const { context } = contextRef;

                // Resupply puts itself into play as a resource instead of the discard pile, so it can't be replayed
                context.player1.clickCard(context.resupply);
                expect(context.resupply).toBeInZone('resource', context.player1);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // The once-per-phase use was not consumed, so the replay is still offered for a later cheap event
                context.player1.clickCard(context.smugglersAid);
                expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.smugglersAid.title));
                context.player1.clickPrompt('Trigger');
                expect(context.smugglersAid).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger for a cheap event the controller plays that is owned by the opponent, and should not consume the once-per-phase use', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vermillion#qiras-auction-house'],
                        groundArena: ['l337#were-programmed-to-learn'],
                        hand: ['smugglers-aid'],
                        base: { card: 'echo-base', damage: 6 }
                    },
                    player2: {
                        deck: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                // Vermillion lets player1 reveal and play the top card of player2's deck (Daring Raid)
                context.player1.clickCard(context.vermillion);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Opponent\'s deck');
                context.player1.clickDone();
                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);

                // Daring Raid goes to its owner's (player2's) discard pile, so L3-37 cannot replay it from player1's discard
                expect(context.daringRaid).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // The once-per-phase use was not consumed, so the replay is still offered for a cheap event player1 owns
                context.player1.clickCard(context.smugglersAid);
                expect(context.player1).toHavePassAbilityPrompt(replayPrompt(context.smugglersAid.title));
                context.player1.clickPrompt('Trigger');

                // Smuggler's Aid healed player1's base both times (6 - 3 - 3 = 0)
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});
