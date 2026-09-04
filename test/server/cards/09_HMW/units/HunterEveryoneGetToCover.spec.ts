describe('Hunter, Everyone Get To Cover!', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            it('should allow choosing two different options: give a Shield token, then attack with a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunter#everyone-get-to-cover'],
                        groundArena: ['wampa', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hunter);

                expect(context.player1).toHavePrompt('Choose 2 of the following');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give a Shield token to a unit.',
                    'Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.'
                ]);

                // First choice: give a Shield token to a unit
                context.player1.clickPrompt('Give a Shield token to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.wampa, context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                // Second choice: attack with a unit
                expect(context.player1).toHavePrompt('Choose 1 of the following');
                context.player1.clickPrompt('Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // Base can't be attacked for this attack, only the enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing the Shield option twice, giving Shield tokens to two different units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunter#everyone-get-to-cover'],
                        groundArena: ['wampa', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hunter);

                context.player1.clickPrompt('Give a Shield token to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.wampa, context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                // The Shield option remains available to choose a second time
                expect(context.player1).toHavePrompt('Choose 1 of the following');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give a Shield token to a unit.',
                    'Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.'
                ]);

                context.player1.clickPrompt('Give a Shield token to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.wampa, context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing the Attack option twice, attacking with two different units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunter#everyone-get-to-cover'],
                        groundArena: ['wampa', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hunter);

                // First attack: Wampa into AT-ST
                context.player1.clickPrompt('Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.consularSecurityForce]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(4);
                expect(context.wampa).toBeInZone('discard');

                // Second attack: Battlefield Marine into Consular Security Force
                expect(context.player1).toHavePrompt('Choose 1 of the following');
                context.player1.clickPrompt('Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow attacking with an exhausted unit, including Hunter itself', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunter#everyone-get-to-cover'],
                        groundArena: ['battlefield-marine', { card: 'wampa', exhausted: true }],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hunter);
                expect(context.hunter.exhausted).toBe(true);

                // First attack: the already-exhausted Wampa can still attack
                context.player1.clickPrompt('Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBe(true);

                // Base can't be selected as the attack target
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(4);
                expect(context.wampa).toBeInZone('discard');

                // Second attack: Hunter itself, still exhausted from entering play
                expect(context.player1).toHavePrompt('Choose 1 of the following');
                context.player1.clickPrompt('Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.battlefieldMarine]);
                context.player1.clickCard(context.hunter);
                expect(context.hunter.exhausted).toBe(true);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard');
                expect(context.hunter.damage).toBe(6);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the Shield option to target a friendly or enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunter#everyone-get-to-cover'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hunter);

                context.player1.clickPrompt('Give a Shield token to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['shield']);

                // Complete the required second choice by targeting a friendly unit
                context.player1.clickPrompt('Give a Shield token to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.hunter, context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should mark the Attack option as "(No effect)" when there are no enemy units to attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hunter#everyone-get-to-cover'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: [],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hunter);

                // The base is not a valid attack target, so with no enemy units the Attack option has no legal target
                expect(context.player1).toHaveExactPromptButtons([
                    'Give a Shield token to a unit.',
                    '(No effect) Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.'
                ]);

                // The no-effect Attack option can still be chosen; it resolves without doing anything and moves to the next choice
                context.player1.clickPrompt('(No effect) Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack.');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toHavePrompt('Choose 1 of the following');

                // Resolve the remaining choice
                context.player1.clickPrompt('Give a Shield token to a unit.');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
