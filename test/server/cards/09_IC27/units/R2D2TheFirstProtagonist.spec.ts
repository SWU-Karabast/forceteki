describe('R2-D2, The First Protagonist', function() {
    integration(function(contextRef) {
        describe('its On Attack ability', function() {
            it('should ready a resource when that option is chosen', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['r2d2#the-first-protagonist'],
                        resources: { readyCount: 17, exhaustedCount: 3 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player1.clickCard(context.r2d2);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons([
                    'Ready a resource',
                    'Deal 1 damage to a ground unit',
                    'Look at the top card of your deck. You may discard it'
                ]);
                context.player1.clickPrompt('Ready a resource');

                expect(context.player1).toHavePrompt('Choose a player to ready a resource');
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');

                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to a ground unit when that option is chosen', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['r2d2#the-first-protagonist'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Deal 1 damage to a ground unit');

                // any ground unit (friendly or enemy) is selectable, but not space units or bases
                expect(context.player1).toHavePrompt('Deal 1 damage to a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.battlefieldMarine]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should look at the top card of the deck and allow discarding it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['r2d2#the-first-protagonist'],
                        deck: ['wampa', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Look at the top card of your deck. You may discard it');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.wampa]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Discard it', 'Leave on top']);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'discard');

                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.deck[0].title).toBe('AT-ST');
                expect(context.player1.deck.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should look at the top card of the deck and allow leaving it on top', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['r2d2#the-first-protagonist'],
                        deck: ['wampa', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Look at the top card of your deck. You may discard it');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.wampa]);

                context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'leave');

                expect(context.player1.deck[0]).toBe(context.wampa);
                expect(context.player1.deck.length).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should mark options with no effect when there are no deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['r2d2#the-first-protagonist'],
                        deck: []
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickCard(context.p2Base);

                // the deck is empty, so the look-at option is marked as having no effect. 'Ready a
                // resource' still shows as legal (it resolves but changes nothing when none are exhausted)
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Ready a resource',
                    'Deal 1 damage to a ground unit',
                    '(No effect) Look at the top card of your deck. You may discard it'
                ]);

                // choosing a no-effect option resolves nothing and the attack proceeds
                context.player1.clickPrompt('(No effect) Look at the top card of your deck. You may discard it');

                expect(context.player1.deck.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
