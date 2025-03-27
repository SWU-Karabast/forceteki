describe('Ezra Bridger', function() {
    integration(function(contextRef) {
        describe('Ezra Bridger\'s ability', function() {
            it('should trigger when he completes an attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moisture-farmer'],
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        deck: ['moment-of-peace',
                            'wampa',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                            'atst',
                        ]
                    },
                    player2: {
                        base: 'dagobah-swamp',
                        groundArena: ['death-trooper', 'occupier-siege-tank']
                    }
                });

                const { context } = contextRef;
                const reset = () => {
                    context.readyCard(context.ezraBridger);
                    context.player2.passAction();
                };

                // CASE 1: We do nothing and put the top card back
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.deathTrooper);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.momentOfPeace]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);
                expect(context.getChatLogs(1)).toContain('player1 looks at a card');
                expect(context.getChatLogs(1)).not.toContain('Moment of Peace');

                // check that the damage was done before player1 clicks prompt
                expect(context.ezraBridger.damage).toBe(3);
                expect(context.deathTrooper).toBeInZone('discard');

                // Leave it on top of the deck
                const beforeActionDeck = context.player1.deck;
                context.player1.clickDisplayCardPromptButton(context.momentOfPeace.uuid, 'leave');
                expect(context.player1.deck).toEqual(beforeActionDeck);
                expect(context.player1.deck.length).toEqual(7);
                expect(context.player1.deck[0]).toBe(context.momentOfPeace);

                // reset
                reset();

                // CASE 2: We discard the card.
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.momentOfPeace]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);

                // check that the damage was done before player1 clicks prompt
                expect(context.p2Base.damage).toBe(3);

                // Discard it
                context.player1.clickDisplayCardPromptButton(context.momentOfPeace.uuid, 'discard');
                expect(context.momentOfPeace).toBeInZone('discard');
                expect(context.player1.deck.length).toEqual(6);
                expect(context.player1.deck[0]).toBe(context.wampa);

                // reset
                reset();

                // CASE 3: We play the card from deck
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.wampa]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);
                expect(context.getChatLogs(1)).not.toContain('Wampa');
                // check that the damage was done before player1 clicks prompt
                expect(context.p2Base.damage).toBe(6);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'play');

                // check board state
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBe(true);
                expect(context.player1.deck.length).toEqual(5);

                // reset
                reset();

                // CASE 4: Check that when ezra is defeated that it does not trigger his ability
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.occupierSiegeTank);

                // check board state
                expect(context.ezraBridger).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when the deck is empty.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moisture-farmer'],
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        deck: [],
                    },
                    player2: {
                        base: 'dagobah-swamp',
                        groundArena: ['death-trooper', 'occupier-siege-tank']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.deathTrooper);

                expect(context.player2).toBeActivePlayer();
            });

            it('can play a unit with Piloting as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        spaceArena: ['cartel-turncoat'],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.player1).toHaveExactPromptButtons(['Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                context.player1.clickPrompt('Play Dagger Squadron Pilot');
                expect(context.daggerSquadronPilot).not.toBeAttachedTo(context.cartelTurncoat);
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });

            it('can play a unit with Piloting as a Pilot upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        spaceArena: ['cartel-turncoat'],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.player1).toHaveExactPromptButtons(['Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                context.player1.clickPrompt('Play Dagger Squadron Pilot with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat]);
                context.player1.clickCard(context.cartelTurncoat);
                expect(context.daggerSquadronPilot).toBeAttachedTo(context.cartelTurncoat);

                expect(context.player2).toBeActivePlayer();
            });

            it('is not prompted to play as unit with Piloting as a pilot if no eligible vehicle exists', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        spaceArena: [{ card: 'cartel-turncoat', upgrades: ['academy-graduate'] }],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });

            it('is not prompted to play as unit with Piloting as a pilot if no vehicles are controlled', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
