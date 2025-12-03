describe('Simultaneous triggers', function() {
    integration(function(contextRef) {
        describe('Chewbacca being attacked by Sabine', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist']
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should prompt the active player(controller of Sabine) which player\'s triggers to resolve first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                // Don't need to click Chewbacca due to sentinel
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(context.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                context.player1.clickPrompt('You');
                expect(context.chewbacca.exhausted).toBe(true);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.chewbacca]);
                expect(context.chewbacca.damage).toBe(0);

                context.player1.clickCard(context.p1Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca.damage).toBe(2);
                expect(context.chewbacca.exhausted).toBe(false);
            });

            it('should have the triggers work in either order', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                // Don't need to click Chewbacca due to sentinel
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(context.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');

                context.player1.clickPrompt('Opponent');
                expect(context.chewbacca.exhausted).toBe(false);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.chewbacca]);
                expect(context.chewbacca.damage).toBe(0);

                context.player1.clickCard(context.p1Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca.damage).toBe(2);
                expect(context.chewbacca.exhausted).toBe(false);
            });
        });

        describe('Two units with a when defeated ability killing each other', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'yoda#old-master', damage: 3 }],
                        deck: ['wampa', 'vanquish', 'repair']
                    },
                    player2: {
                        groundArena: ['vanguard-infantry', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should let the active player choose which player\'s triggers happen first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                context.player1.clickPrompt('You');

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);
                expect(context.player1.hand.length).toBe(0);
                context.player1.clickPrompt('You');
                context.player1.clickDone();
                expect(context.player1.hand.length).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.allianceXwing, context.battlefieldMarine]);
                expect(context.allianceXwing).toHaveExactUpgradeNames([]);
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should have the triggers work in either order', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                context.player1.clickPrompt('Opponent');

                expect(context.player2).toBeAbleToSelectExactly([context.allianceXwing, context.battlefieldMarine]);
                expect(context.allianceXwing).toHaveExactUpgradeNames([]);
                context.player2.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);
                expect(context.player1.hand.length).toBe(0);
                context.player1.clickPrompt('You');
                context.player1.clickDone();
                expect(context.player1.hand.length).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The same ability triggered multiple times in the same window', function () {
            it('should only create a single trigger prompt if the ability uses a collective trigger', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        hand: ['guerilla-soldier']
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.guerillaSoldier);
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 2],
                    [context.battlefieldMarine, 1],
                ]));

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to deal 1 indirect damage to a player');
                context.player1.clickPrompt('Trigger');

                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1],
                ]));
                expect(context.player2).toBeActivePlayer();
            });

            it('should create a named trigger button for each target if the ability does not have a collective trigger', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['guerilla-soldier'],
                        groundArena: ['allegiant-general-pryde#ruthless-and-loyal']
                    },
                    player2: {
                        groundArena: [
                            { card: 'wampa', upgrades: ['shield'] },
                            { card: 'battlefield-marine', upgrades: ['devotion'] }
                        ],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.guerillaSoldier);
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 2],
                    [context.battlefieldMarine, 1],
                ]));

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Defeat a non-unique upgrade on the unit: Battlefield Marine',
                    'Defeat a non-unique upgrade on the unit: Wampa'
                ]);

                context.player1.clickPrompt('Defeat a non-unique upgrade on the unit: Battlefield Marine');
                expect(context.player1).toBeAbleToSelectExactly([context.devotion]);
                context.player1.clickCard(context.devotion);

                expect(context.player1).toHavePrompt('Defeat a non-unique upgrade on the unit: Wampa');
                expect(context.player1).toBeAbleToSelectExactly([context.shield]);
                context.player1.clickCard(context.shield);

                expect(context.player2).toBeActivePlayer();
                expect(context.devotion).toBeInZone('discard');
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
            });

            it('should work correctly if sharing the window with another ability and only one of them has collective trigger', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        hand: ['guerilla-soldier'],
                        groundArena: ['allegiant-general-pryde#ruthless-and-loyal']
                    },
                    player2: {
                        groundArena: [
                            { card: 'wampa', upgrades: ['shield'] },
                            { card: 'battlefield-marine', upgrades: ['devotion'] }
                        ],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.guerillaSoldier);
                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 2],
                    [context.battlefieldMarine, 1],
                ]));

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Exhaust this leader to deal 1 indirect damage to a player',
                    'Defeat a non-unique upgrade on the unit: Battlefield Marine',
                    'Defeat a non-unique upgrade on the unit: Wampa'
                ]);

                context.player1.clickPrompt('Defeat a non-unique upgrade on the unit: Battlefield Marine');
                expect(context.player1).toBeAbleToSelectExactly([context.devotion]);
                context.player1.clickCard(context.devotion);

                context.player1.clickPrompt('Defeat a non-unique upgrade on the unit: Wampa');
                expect(context.player1).toBeAbleToSelectExactly([context.shield]);
                context.player1.clickCard(context.shield);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to deal 1 indirect damage to a player');
                context.player1.clickPrompt('Trigger');

                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.devotion).toBeInZone('discard');
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
            });
        });
    });
});
