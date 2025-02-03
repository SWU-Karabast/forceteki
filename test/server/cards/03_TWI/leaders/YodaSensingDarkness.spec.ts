describe('Yoda, Sensing Darkness', function () {
    integration(function (contextRef) {
        describe('Yoda\'s leader undeployed ability', function () {
            it('Yoda can draw a card then put a card on top/bottom of deck when a unit has left play', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        hand: ['wampa', 'krayt-dragon', 'vanquish'],
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 7,
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'liberated-slaves', 'pyke-sentinel']
                    },
                });

                const { context } = contextRef;

                // Defeat unit
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // Yoda Leader ability should activate
                context.player1.clickCard(context.yoda);
                expect(context.player1).toHaveEnabledPromptButtons(['Deploy Yoda', 'If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.']);
                context.player1.clickPrompt('If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.');
                expect(context.player1.handSize).toBe(3);
                expect(context.entrenched).toBeInZone('hand', context.player1);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.kraytDragon, context.entrenched]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Select Card, Then Choose Top
                context.player1.clickCard(context.kraytDragon);
                expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player1.clickPrompt('Top');
                expect(context.kraytDragon).toBeInZone('deck', context.player1);
                expect(context.player1.deck[0]).toBe(context.kraytDragon);
            });

            it('When deployed, Yoda can optionally discard the top card of his deck to defeat an enemy non-leader unit with cost equal to or lesser than the cost of the discarded card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        hand: ['wampa', 'krayt-dragon', 'vanquish'],
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 7,
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'liberated-slaves', 'pyke-sentinel']
                    },
                });

                const { context } = contextRef;
                // Yoda Leader should deploy
                context.player1.clickCard(context.yoda);
                expect(context.player1).toHaveEnabledPromptButtons(['Deploy Yoda', 'If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.']);
                context.player1.clickPrompt('Deploy Yoda');
                expect(context.yoda).toBeInZone('groundArena', context.player1);

                // Should be able to pass
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'You may discard the top card from your deck. If you do, defeat an enemy non-leader unit with cost equal to or less than the cost of the discarded card.']);
                context.player1.clickPrompt('You may discard the top card from your deck. If you do, defeat an enemy non-leader unit with cost equal to or less than the cost of the discarded card.');
                expect(context.entrenched).toBeInZone('discard', context.player1);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
            });

            it('Yoda ability does not work when no unit has left play and can deploy without defeating anything', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        hand: ['wampa', 'krayt-dragon', 'vanquish'],
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 7,
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'liberated-slaves', 'pyke-sentinel']
                    },
                });

                const { context } = contextRef;

                // Yoda Leader ability should not activate
                context.player1.clickCard(context.yoda);
                expect(context.player1).toHaveEnabledPromptButtons(['Deploy Yoda', 'If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.']);
                context.player1.clickPrompt('If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.');
                expect(context.yoda.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // Yoda Leader should deploy
                context.player1.clickCard(context.yoda);
                expect(context.yoda).toBeInZone('groundArena', context.player1);

                // Should be able to pass
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'You may discard the top card from your deck. If you do, defeat an enemy non-leader unit with cost equal to or less than the cost of the discarded card.']);
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
