describe('Ezra Bridger', function() {
    integration(function(contextRef) {
        describe('Ezra Bridger\'s ability', function() {
            it('should trigger when he completes an attack', function () {
                contextRef.setupTest({
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
                    context.ezraBridger.exhausted = false;
                    context.player2.passAction();
                };

                // CASE 1: We do nothing and put the top card back
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.deathTrooper);

                // TODO: we need a 'look at' prompt for secretly revealing, currently chat logs go to all players
                expect(context.getChatLogs(1)).toContain('Ezra Bridger sees Moment of Peace');
                expect(context.player1).toHaveExactPromptButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);

                // check that the damage was done before player1 clicks prompt
                expect(context.ezraBridger.damage).toBe(3);
                expect(context.deathTrooper).toBeInZone('discard');

                // Leave it on top of the deck
                const beforeActionDeck = context.player1.deck;
                context.player1.clickPrompt('Leave it on top of your deck');
                expect(context.player1.deck).toEqual(beforeActionDeck);
                expect(context.player1.deck.length).toEqual(7);
                expect(context.player1.deck[0]).toBe(context.momentOfPeace);

                // reset
                reset();

                // CASE 2: We discard the card.
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);
                // TODO: we need a 'look at' prompt for secretly revealing, currently chat logs go to all players
                expect(context.getChatLogs(1)).toContain('Ezra Bridger sees Moment of Peace');
                expect(context.player1).toHaveExactPromptButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);

                // check that the damage was done before player1 clicks prompt
                expect(context.p2Base.damage).toBe(3);

                // Discard it
                context.player1.clickPrompt('Discard it');
                expect(context.momentOfPeace).toBeInZone('discard');
                expect(context.player1.deck.length).toEqual(6);
                expect(context.player1.deck[0]).toBe(context.wampa);

                // reset
                reset();

                // CASE 3: We play the card from deck
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // TODO: we need a 'look at' prompt for secretly revealing, currently chat logs go to all players
                expect(context.getChatLogs(1)).toContain('Ezra Bridger sees Wampa');
                expect(context.player1).toHaveExactPromptButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);
                // check that the damage was done before player1 clicks prompt
                expect(context.p2Base.damage).toBe(6);

                context.player1.clickPrompt('Play it');

                // check board state
                expect(context.player1.countExhaustedResources()).toBe(4);
                expect(context.wampa).toBeInZone('ground arena');
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

            it('should not trigger when the deck is empty.', function () {
                contextRef.setupTest({
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
        });
    });
});
