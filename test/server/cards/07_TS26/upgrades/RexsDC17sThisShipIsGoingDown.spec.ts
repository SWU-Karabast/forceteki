describe('Rex\'s DC-17s, This Ship Is Going Down', function() {
    integration(function(contextRef) {
        describe('Attach condition', function() {
            it('can only attach to non-Vehicle units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rexs-dc17s#this-ship-is-going-down'],
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Rex's DC-17s
                context.player1.clickCard(context.rexsDc17s);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    // Enemy units and leader units are valid targets
                    context.wampa,
                    context.lukeSkywalker
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['rexs-dc17s#this-ship-is-going-down']);
            });
        });

        describe('Triggered ability', function() {
            it('readies attached unit when an enemy unit readies during the action phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        resources: 5,
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true, upgrades: ['rexs-dc17s#this-ship-is-going-down'] }
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability to ready an enemy unit
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.wampa);

                // Verify Battlefield Marine was readied by the upgrade's triggered ability
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.getChatLogs(2)).toContain('player1 uses Battlefield Marine\'s gained ability from Rex\'s DC-17s to ready Battlefield Marine');
            });

            it('cannot be used multiple times per round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        resources: 5,
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true, upgrades: ['rexs-dc17s#this-ship-is-going-down'] }
                        ]
                    },
                    player2: {
                        hand: ['bravado'],
                        groundArena: [
                            { card: 'wampa', exhausted: true },
                            { card: 'atst', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability to ready an enemy unit
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.wampa);

                // Battlefield Marine is readied by the upgrade
                expect(context.battlefieldMarine.exhausted).toBe(false);

                // Exhaust Battlefield Marine again by attacking
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.battlefieldMarine.exhausted).toBe(true);

                // P2 plays Bravado to ready another enemy unit
                context.player2.clickCard(context.bravado);
                context.player2.clickCard(context.atst);

                // Battlefield Marine should not ready this time
                expect(context.battlefieldMarine.exhausted).toBe(true);
            });

            it('does not consume the ability when attached unit is already ready', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        resources: 5,
                        groundArena: [
                            // Start ready
                            { card: 'battlefield-marine', upgrades: ['rexs-dc17s#this-ship-is-going-down'] }
                        ]
                    },
                    player2: {
                        hand: ['bravado'],
                        groundArena: [
                            { card: 'wampa', exhausted: true },
                            { card: 'atst', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability to ready Wampa - DC-17s triggers but attached unit is already ready
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.wampa);
                expect(context.battlefieldMarine.exhausted).toBe(false);

                // Attack with Battlefield Marine to exhaust it
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.battlefieldMarine.exhausted).toBe(true);

                // Player 2 uses Bravado to ready AT-ST
                context.player2.clickCard(context.bravado);
                context.player2.clickCard(context.atst);

                // DC-17s should trigger now - ability wasn't consumed earlier
                expect(context.battlefieldMarine.exhausted).toBe(false);
            });

            it('does not trigger during the regroup phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // Use Dryden Vos - he doesn't ready during regroup if he used his ability
                        groundArena: [
                            { card: 'dryden-vos#i-get-all-worked-up', upgrades: ['rexs-dc17s#this-ship-is-going-down'] }
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Attack with Dryden Vos and use his ability to not ready during regroup
                context.player1.clickCard(context.drydenVos);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');

                expect(context.drydenVos.exhausted).toBe(true);

                // Move to next action phase
                context.moveToNextActionPhase();

                // Wampa readied during the regroup phase, but it did not trigger Dryden's gained ability from DC-17s
                expect(context.wampa.exhausted).toBe(false);
                expect(context.drydenVos.exhausted).toBe(true);
            });

            it('does not ready attached unit if it has a "cannot ready" effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rex#no-other-option',
                        resources: 5,
                        groundArena: [
                            {
                                card: 'battlefield-marine',
                                exhausted: true,
                                upgrades: [
                                    'rexs-dc17s#this-ship-is-going-down',
                                    'frozen-in-carbonite'
                                ]
                            }
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Use Rex's ability to ready an enemy unit
                context.player1.clickCard(context.rex);
                context.player1.clickCard(context.wampa);

                // Battlefield Marine should ready due to Frozen in Carbonite's restriction
                expect(context.battlefieldMarine.exhausted).toBe(true);
            });
        });
    });
});
