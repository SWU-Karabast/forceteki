describe('Reanimated Night Trooper', function() {
    integration(function(contextRef) {
        describe('When Defeated ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['reanimated-night-trooper'],
                        deck: ['battlefield-marine', 'wampa']
                    },
                    player2: {
                        hand: ['vanquish'],
                        deck: ['daring-raid', 'open-fire'],
                        hasInitiative: true
                    }
                });
            });

            it('should look at and discard the top card of its controller\'s deck', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.reanimatedNightTrooper);

                expect(context.player1).toHavePrompt('Choose a deck to look at the top card');
                expect(context.player1).toHaveEnabledPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Your deck');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Discard it', 'Leave it on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);

                context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'discard');

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.deck.length).toBe(1);
                expect(context.player1.deck[0]).toBe(context.wampa);
                expect(context.player1).toBeActivePlayer();
            });

            it('should look at and discard the top card of the opponent\'s deck', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.reanimatedNightTrooper);

                expect(context.player1).toHavePrompt('Choose a deck to look at the top card');
                context.player1.clickPrompt('Opponent\'s deck');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.daringRaid]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Discard it', 'Leave it on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.daringRaid.title);

                context.player1.clickDisplayCardPromptButton(context.daringRaid.uuid, 'discard');

                expect(context.daringRaid).toBeInZone('discard');
                expect(context.player2.deck.length).toBe(1);
                expect(context.player2.deck[0]).toBe(context.openFire);
                expect(context.player1).toBeActivePlayer();
            });

            it('should leave the viewed card on top of the selected deck when declining to discard', function() {
                const { context } = contextRef;
                const player2Deck = context.player2.deck;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.reanimatedNightTrooper);

                expect(context.player1).toHavePrompt('Choose a deck to look at the top card');
                context.player1.clickPrompt('Opponent\'s deck');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.daringRaid]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Discard it', 'Leave it on top']);

                context.player1.clickDisplayCardPromptButton(context.daringRaid.uuid, 'leave');

                expect(context.player2.deck).toEqual(player2Deck);
                expect(context.player2.deck.length).toBe(2);
                expect(context.player2.deck[0]).toBe(context.daringRaid);
                expect(context.daringRaid).toBeInZone('deck');
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
