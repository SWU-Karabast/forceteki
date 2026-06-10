describe('Clan Wren Loyalist', function() {
    integration(function(contextRef) {
        describe('Clan Wren Loyalist\'s when played ability', function() {
            it('should search top 5 cards for a unit that shares a trait with a friendly unit and draw it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-loyalist'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['chopper#spectre-three', 'wampa', 'atst', 'pyke-sentinel', 'battlefield-marine', 'cartel-spacer']
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clanWrenLoyalist);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.chopper, context.battlefieldMarine],
                    invalid: [context.wampa, context.atst, context.pykeSentinel]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.chopper);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.chopper]);
                context.player2.clickDone();

                expect(context.chopper).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow taking nothing after triggering deck search', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-loyalist'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['chopper#spectre-three', 'wampa', 'atst', 'pyke-sentinel', 'sabine-wren#explosives-artist']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clanWrenLoyalist);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.chopper).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should show all cards as invalid if no units in deck share an aspect with friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-loyalist'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['wampa', 'atst', 'awing', 'cartel-spacer', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clanWrenLoyalist);

                // All cards are invalid, must click Take nothing
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.wampa, context.atst, context.awing, context.cartelSpacer, context.tielnFighter]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if deck is empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-loyalist'],
                        groundArena: ['battlefield-marine'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clanWrenLoyalist);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});