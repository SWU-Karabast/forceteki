describe('R2-D2, Part of the Plan', function() {
    integration(function(contextRef) {
        describe('R2-D2\'s when played ability', function() {
            it('should search top 5 cards for a unit that shares an aspect with a friendly unit and draw it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#part-of-the-plan'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['chopper#spectre-three', 'wampa', 'atst', 'pyke-sentinel', 'battlefield-marine', 'cartel-spacer']
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                // Ability is optional, click Trigger
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.chopper, context.battlefieldMarine, context.pykeSentinel],
                    invalid: [context.wampa, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.chopper);

                expect(context.chopper).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing on the ability without triggering deck search', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#part-of-the-plan'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['chopper#spectre-three', 'wampa', 'atst', 'pyke-sentinel', 'sabine-wren#explosives-artist']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);

                // Pass on the optional ability
                context.player1.clickPrompt('Pass');

                expect(context.chopper).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow taking nothing after triggering deck search', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#part-of-the-plan'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['chopper#spectre-three', 'wampa', 'atst', 'pyke-sentinel', 'sabine-wren#explosives-artist']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.chopper).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should show all cards as invalid if no units in deck share an aspect with friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#part-of-the-plan'],
                        groundArena: ['ezra-bridger#spectre-six'],
                        deck: ['wampa', 'atst', 'awing', 'cartel-spacer', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickPrompt('Trigger');

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
                        hand: ['r2d2#part-of-the-plan'],
                        groundArena: ['battlefield-marine'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);

                // With empty deck, ability should auto-pass (no Trigger prompt)
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
