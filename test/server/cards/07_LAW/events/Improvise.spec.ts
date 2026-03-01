describe('Improvise', function() {
    integration(function(contextRef) {
        describe('Improvise\'s ability', function() {
            it('should leave card on top of deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'shadowed-undercity',
                        hand: ['improvise'],
                        groundArena: ['moisture-farmer'],
                        resources: 6,
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
                // CASE 1: We do nothing and put the top card back
                context.player1.clickCard(context.improvise);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.momentOfPeace]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it (it costs 1 less)', 'Discard it', 'Leave it on top of your deck']);

                // Leave it on top of the deck
                const beforeActionDeck = context.player1.deck;
                context.player1.clickDisplayCardPromptButton(context.momentOfPeace.uuid, 'leave');
                expect(context.player1.deck).toEqual(beforeActionDeck);
                expect(context.player1.deck.length).toEqual(7);
                expect(context.player1.deck[0]).toBe(context.momentOfPeace);
            });

            it('should discard the card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'shadowed-undercity',
                        hand: ['improvise'],
                        groundArena: ['moisture-farmer'],
                        resources: 6,
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

                context.player1.clickCard(context.improvise);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.momentOfPeace]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it (it costs 1 less)', 'Discard it', 'Leave it on top of your deck']);

                context.player1.clickDisplayCardPromptButton(context.momentOfPeace.uuid, 'discard');
                expect(context.momentOfPeace).toBeInZone('discard');
                expect(context.player1.deck.length).toEqual(6);
                expect(context.player1.deck[0]).toBe(context.wampa);
            });

            it('should play the card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'imperial-prison-complex',
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        hand: ['improvise'],
                        groundArena: ['moisture-farmer'],
                        resources: 6,
                        deck: [
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

                context.player1.clickCard(context.improvise);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.wampa]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it (it costs 1 less)', 'Discard it', 'Leave it on top of your deck']);
                expect(context.getChatLogs(1)).not.toContain('Wampa');

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'play');

                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBe(true);
                expect(context.player1.deck.length).toEqual(5);
                expect(context.getChatLogs(2)).toContain('player1 uses Improvise to play Wampa from the top of their deck');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when the deck is empty.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['improvise'],
                        groundArena: ['moisture-farmer'],
                        deck: [],
                    },
                    player2: {
                        base: 'dagobah-swamp',
                        groundArena: ['death-trooper', 'occupier-siege-tank']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.improvise);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
            });

            it('can play a unit with Piloting as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['improvise'],
                        spaceArena: ['cartel-turncoat'],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.improvise);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.player1).toHaveExactPromptButtons(['Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                context.player1.clickPrompt('Play Dagger Squadron Pilot');
                expect(context.daggerSquadronPilot).not.toBeAttachedTo(context.cartelTurncoat);
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('can play a unit with Piloting as a Pilot upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['improvise'],
                        spaceArena: ['cartel-turncoat'],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.improvise);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.player1).toHaveExactPromptButtons(['Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                context.player1.clickPrompt('Play Dagger Squadron Pilot with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat]);
                context.player1.clickCard(context.cartelTurncoat);
                expect(context.daggerSquadronPilot).toBeAttachedTo(context.cartelTurncoat);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('is not prompted to play as unit with Piloting as a pilot if no eligible vehicle exists', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['improvise'],
                        spaceArena: [{ card: 'cartel-turncoat', upgrades: ['academy-graduate'] }],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.improvise);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('is not prompted to play as unit with Piloting as a pilot if no vehicles are controlled', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['improvise'],
                        deck: ['dagger-squadron-pilot']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.improvise);
                context.player1.clickDisplayCardPromptButton(context.daggerSquadronPilot.uuid, 'play');
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});