describe('Reinforcement Walker', function() {
    integration(function(contextRef) {
        describe('Reinforcement Walker\'s ability', function() {
            it('should let the play draw a card when played and on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reinforcement-walker'],
                        deck: ['alliance-xwing', 'echo-base-defender', 'attack-pattern-delta', 'battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // Case 1: The player is able to look at the top card of their deck when Reinforcement Walker is played
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.allianceXwing]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.allianceXwing.title);  // confirm that there is no chat message for the cards

                context.player1.clickDisplayCardPromptButton(context.allianceXwing.uuid, 'draw');
                expect(context.allianceXwing).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // Case 2: The player is able to look at the top card of their deck when Reinforcement Walker attacks
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);  // confirm that there is no chat message for the cards

                context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'draw');
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the play discard a card and heal 3 damage from their base on attack when played and on attack',
                async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['reinforcement-walker'],
                            deck: ['alliance-xwing', 'echo-base-defender', 'attack-pattern-delta', 'battlefield-marine']
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });

                    const { context } = contextRef;
                    context.setDamage(context.p1Base, 10);

                    /* Case 1: The user is able to discard the card and heal 3 damage from their base when they play
                    Reinforcement Walker and click 'Discard' */
                    context.player1.clickCard(context.reinforcementWalker);
                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.allianceXwing]);
                    expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                    expect(context.getChatLogs(1)[0]).not.toContain(context.allianceXwing.title);  // confirm that there is no chat message for the cards

                    context.player1.clickDisplayCardPromptButton(context.allianceXwing.uuid, 'discard');
                    expect(context.allianceXwing).toBeInZone('discard');
                    expect(context.p1Base.damage).toEqual(7);
                    expect(context.player2).toBeActivePlayer();

                    context.moveToNextActionPhase();

                    /* Case 2: The user is able to discard the card and heal 3 damage from their base when they attack
                    with Reinforcement Walker and click 'Discard' */
                    context.player1.clickCard(context.reinforcementWalker);
                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine]);
                    expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                    expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);  // confirm that there is no chat message for the cards

                    context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'discard');
                    expect(context.battlefieldMarine).toBeInZone('discard');
                    expect(context.p1Base.damage).toEqual(4);
                    expect(context.player2).toBeActivePlayer();
                }
            );

            it('should skip abilities when the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reinforcement-walker'],
                        deck: []
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // Case 1: It should skip abilities when Reinforcement Walker is played
                context.player1.clickCard(context.reinforcementWalker);
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // Case 3: It should skip abilities when Reinforcement Walker is attacks
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger abilities twice when played with Ambush', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reinforcement-walker'],
                        deck: ['alliance-xwing', 'echo-base-defender', 'attack-pattern-delta'],
                        groundArena: ['admiral-piett#captain-of-the-executor']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // The player can choose to resolve the ability or Ambush first.
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player1).toHaveExactPromptButtons([
                    'Ambush',
                    'Look at the top card of your deck. Draw it or discard it and heal 3 damage from your base.',
                ]);

                // The ability from on played resolves successfully.
                context.player1.clickPrompt('Look at the top card of your deck. Draw it or discard it and heal 3 damage from your base.');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.allianceXwing]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.allianceXwing.title);  // confirm that there is no chat message for the cards

                context.player1.clickDisplayCardPromptButton(context.allianceXwing.uuid, 'draw');
                expect(context.allianceXwing).toBeInZone('hand');

                // The on attack ability from Ambush resolved successfully.
                expect(context.player1).toHaveExactPromptButtons([
                    'Ambush',
                    'Pass',
                ]);

                context.player1.clickPrompt('Ambush');

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.echoBaseDefender]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Draw', 'Discard']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.echoBaseDefender.title);  // confirm that there is no chat message for the cards

                context.player1.clickDisplayCardPromptButton(context.echoBaseDefender.uuid, 'draw');
                expect(context.echoBaseDefender).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
