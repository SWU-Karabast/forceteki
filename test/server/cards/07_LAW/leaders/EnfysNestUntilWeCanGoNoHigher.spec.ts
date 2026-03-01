describe('Enfys Nest, Until We Can Go No Higher', function() {
    integration(function(contextRef) {
        describe('Undeployed leader-side ability', function() {
            const onAttackPrompt = (cardTitle: string) => `Pay 2 resources and exhaust Enfys Nest to use ${cardTitle}'s "On Attack" ability again`;
            it('When you use an On Attack ability, you may pay 2 resources and exhaust Enfys Nest to use that ability again', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'enfys-nest#until-we-can-go-no-higher',
                        groundArena: ['han-solo#hibernation-sick']
                    }
                });

                const { context } = contextRef;

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Han gives himself an experience token, and Enfys Nest ability should trigger
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toHavePassAbilityPrompt(onAttackPrompt(context.hanSolo.title));
                context.player1.clickPrompt('Trigger');

                // Verify final state
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.enfysNest.exhausted).toBeTrue();
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('lets the player choose which On Attack ability to use again if multiple are triggered', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'enfys-nest#until-we-can-go-no-higher',
                        hand: ['confiscate', 'restock'],
                        groundArena: [
                            { card: 'han-solo#hibernation-sick', upgrades: ['battle-fury'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Han Solo to trigger his On Attack abilities
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Give an Experience token to this unit',
                    'Discard a card from your hand'
                ]);

                // Choose Battle Fury's ability
                context.player1.clickPrompt('Discard a card from your hand');
                expect(context.player1).toHavePrompt('Choose a card to discard for Han Solo\'s effect');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.confiscate,
                    context.restock
                ]);
                context.player1.clickCard(context.confiscate);
                expect(context.confiscate).toBeInZone('discard', context.player1);

                // Enfys Nest ability should trigger, we'll pass on using this one
                expect(context.player1).toHavePassAbilityPrompt(onAttackPrompt(context.hanSolo.title));
                context.player1.clickPrompt('Pass');

                // Han's ability automatically resolves
                expect(context.hanSolo).toHaveExactUpgradeNames(['battle-fury', 'experience']);

                // Enfys Nest ability triggers again for the second On Attack ability
                expect(context.player1).toHavePassAbilityPrompt(onAttackPrompt(context.hanSolo.title));
                context.player1.clickPrompt('Trigger');

                // Han gets a second experience token
                expect(context.hanSolo).toHaveExactUpgradeNames(['battle-fury', 'experience', 'experience']);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.enfysNest.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('lets the player choose which On Attack ability to use again if multiple are triggered from different units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'enfys-nest#until-we-can-go-no-higher',
                        base: 'echo-base',
                        hand: ['rebel-assault'],
                        groundArena: ['sabine-wren#explosives-artist', 'general-draven#doing-what-must-be-done']
                    }
                });

                const { context } = contextRef;

                // Play Rebel Assault to attack with both Sabine and Draven
                context.player1.clickCard(context.rebelAssault);
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);

                // Resolve Sabine's On Attack ability
                expect(context.player1).toHavePrompt('Deal 1 damage to the defender or a base');
                context.player1.clickCard(context.p2Base);

                // Enfys Nest ability should trigger, we'll pass on using this one
                expect(context.player1).toHavePassAbilityPrompt(onAttackPrompt(context.sabineWren.title));
                context.player1.clickPrompt('Pass');

                // Draven attacks
                context.player1.clickCard(context.generalDraven);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.findCardsByName('xwing').length).toBe(1);

                // Enfys Nest ability should trigger for Draven's On Attack ability
                expect(context.player1).toHavePassAbilityPrompt(onAttackPrompt(context.generalDraven.title));
                context.player1.clickPrompt('Trigger');

                // Draven's ability resolves again
                expect(context.player1.findCardsByName('xwing').length).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(3); // One for Rebel Assault, two for Enfys Nest
                expect(context.enfysNest.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger if Enfys Nest is already exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'enfys-nest#until-we-can-go-no-higher', exhausted: true },
                        groundArena: ['han-solo#hibernation-sick']
                    }
                });

                const { context } = contextRef;

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Han gives himself an experience token, and Enfys Nest ability should NOT trigger
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).not.toHavePassAbilityPrompt(onAttackPrompt(context.hanSolo.title));
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger if the player cannot pay the 2 resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'enfys-nest#until-we-can-go-no-higher',
                        groundArena: ['han-solo#hibernation-sick'],
                        resources: {
                            exhaustedCount: 4,
                            readyCount: 0
                        },
                    }
                });

                const { context } = contextRef;

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Han gives himself an experience token, and Enfys Nest ability should NOT trigger
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).not.toHavePassAbilityPrompt(onAttackPrompt(context.hanSolo.title));
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used with Qui-Gon Jinn\'s Aethersprite to effectively triple trigger When Played abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'enfys-nest#until-we-can-go-no-higher',
                        hand: [
                            'enfys-nest#champion-of-justice'
                        ],
                        spaceArena: [
                            'quigon-jinns-aethersprite#guided-by-the-force'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'consular-security-force',
                            'echo-base-defender'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Aethersprite to double up the next When Played ability
                context.player1.clickCard(context.quigonJinnsAethersprite);
                context.player1.clickCard(context.p2Base);

                // Aethersprite triggers its On Attack ability, triggering Enfys Nest to use it again
                expect(context.player1).toHavePassAbilityPrompt(onAttackPrompt(context.quigonJinnsAethersprite.title));
                context.player1.clickPrompt('Trigger');

                // Verify leader ability state
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.enfysNestUntilWeCanGoNoHigher.exhausted).toBeTrue();

                context.player2.passAction();

                // Now play Enfys Nest unit, effectively using its When Played ability three times
                context.player1.clickCard(context.enfysNestChampionOfJustice);
                expect(context.player1).toHavePrompt('Return an enemy non-leader unit with less power than this unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.echoBaseDefender
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Use that "When Played" ability again');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHavePrompt('Return an enemy non-leader unit with less power than this unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.consularSecurityForce,
                    context.echoBaseDefender
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePassAbilityPrompt('Use that "When Played" ability again');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHavePrompt('Return an enemy non-leader unit with less power than this unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.echoBaseDefender
                ]);
                context.player1.clickCard(context.echoBaseDefender);

                // Verify final state
                expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
                expect(context.consularSecurityForce).toBeInZone('hand', context.player2);
                expect(context.echoBaseDefender).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger for the When Defeated part of an On Attack/When Defeated ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'enfys-nest#until-we-can-go-no-higher', exhausted: true },
                        spaceArena: ['executor#might-of-the-empire']
                    },
                    player2: {
                        hand: ['fell-the-dragon']
                    }
                });

                const { context } = contextRef;

                function expectTieFighters(player, count) {
                    const tieFighters = player.findCardsByName('tie-fighter');

                    expect(tieFighters.length).toBe(count);
                    expect(tieFighters).toAllBeInZone('spaceArena', player);
                }

                // Attack with Executor to trigger its On Attack ability
                context.player1.clickCard(context.executor);
                context.player1.clickCard(context.p2Base);
                expectTieFighters(context.player1, 3);

                // Move to the next action phase
                context.moveToNextActionPhase();
                context.player1.passAction();

                // P2 uses Fell the Dragon to defeat Executor
                context.player2.clickCard(context.fellTheDragon);
                context.player2.clickCard(context.executor);

                // Executor's When Defeated ability should trigger, but Enfys Nest ability should NOT trigger
                expectTieFighters(context.player1, 6);
                expect(context.player1).not.toHavePassAbilityPrompt(onAttackPrompt(context.executor.title));
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger for enemy On Attack abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'enfys-nest#until-we-can-go-no-higher',
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['han-solo#hibernation-sick']
                    }
                });

                const { context } = contextRef;

                // P2 attacks with Han Solo to trigger his On Attack ability
                context.player2.clickCard(context.hanSolo);
                context.player2.clickCard(context.p1Base);

                // Han gives himself an experience token, and Enfys Nest ability should NOT trigger for P2's On Attack ability
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).not.toHavePassAbilityPrompt(onAttackPrompt(context.hanSolo.title));
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Deployed unit-side ability', function() {
            it('When you use an On Attack ability, you may use that ability again (once per round)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'enfys-nest#until-we-can-go-no-higher', deployed: true },
                        resources: {
                            exhaustedCount: 2,
                            readyCount: 3
                        },
                        groundArena: ['han-solo#hibernation-sick', 'coruscant-dissident']
                    }
                });

                const { context } = contextRef;

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Han gives himself an experience token, and Enfys Nest ability should trigger
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toHavePassAbilityPrompt(`Use ${context.hanSolo.title}'s "On Attack" ability again`);
                context.player1.clickPrompt('Trigger');

                // Han gets a second experience token
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience', 'experience']);
                context.player2.passAction();

                // Attack with Coruscant Dissident to trigger its On Attack ability
                context.player1.clickCard(context.coruscantDissident);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Ready a resource');
                context.player1.clickPrompt('Trigger');

                // Enfys Nest does not trigger again this round
                expect(context.player1).not.toHavePassAbilityPrompt(`Use ${context.coruscantDissident.title}'s "On Attack" ability again`);
                expect(context.player1.exhaustedResourceCount).toBe(1); // Only 1 was readied by Coruscant Dissident
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
