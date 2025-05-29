describe('Deploy a Leader as a Pilot', function() {
    integration(function(contextRef) {
        describe('Leaders with Pilot deploys', function() {
            it('can be deployed as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
                context.player1.clickPrompt('Deploy Boba Fett');
                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('groundArena');
                expect(context.bobaFett.getPower()).toBe(4);
                expect(context.bobaFett.getHp()).toBe(7);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.bobaFett);

                context.moveToNextActionPhase();
                expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('can be deployed as a Pilot upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['wampa', 'moisture-farmer'],
                        spaceArena: ['concord-dawn-interceptors'],
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('spaceArena');
                expect(context.cartelSpacer.getPower()).toBe(6);
                expect(context.cartelSpacer.getHp()).toBe(7);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa, context.moistureFarmer, context.concordDawnInterceptors]);
                context.player1.setDistributeDamagePromptState(new Map([]));

                context.player2.clickCard(context.rivalsFall);
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa, context.moistureFarmer, context.concordDawnInterceptors]);
                context.player2.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.bobaFett).toBeInZone('base');
                expect(context.bobaFett.exhausted).toBe(true);
                expect(context.bobaFett.deployed).toBe(false);

                context.moveToNextActionPhase();
                expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('cannot be prevented from deploying as an upgrade by Regional Governor', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['regional-governor']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.regionalGovernor);
                context.player2.chooseListOption('Boba Fett');

                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('spaceArena');
                expect(context.cartelSpacer.getPower()).toBe(6);
                expect(context.cartelSpacer.getHp()).toBe(7);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.regionalGovernor]);
                context.player1.setDistributeDamagePromptState(new Map([]));
            });

            it('can be defeated by an upgrade removal', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['confiscate']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('spaceArena');
                expect(context.cartelSpacer.getPower()).toBe(6);
                expect(context.cartelSpacer.getHp()).toBe(7);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.setDistributeDamagePromptState(new Map([]));

                context.player2.clickCard(context.confiscate);
                expect(context.player2).toBeAbleToSelectExactly([context.bobaFett]);
                context.player2.clickCard(context.bobaFett);

                expect(context.bobaFett).toBeInZone('base');
                expect(context.bobaFett.exhausted).toBe(true);
                expect(context.bobaFett.deployed).toBe(false);

                context.moveToNextActionPhase();
                expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('stop making the attached unit a leader if the leader upgrade is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['confiscate', 'waylay']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('spaceArena');
                expect(context.cartelSpacer.getPower()).toBe(6);
                expect(context.cartelSpacer.getHp()).toBe(7);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.setDistributeDamagePromptState(new Map([]));

                context.player2.clickCard(context.confiscate);
                expect(context.player2).toBeAbleToSelectExactly([context.bobaFett]);
                context.player2.clickCard(context.bobaFett);

                expect(context.bobaFett).toBeInZone('base');
                expect(context.bobaFett.exhausted).toBe(true);
                expect(context.bobaFett.deployed).toBe(false);

                context.player1.claimInitiative();
                context.player2.clickCard(context.waylay);
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('hand');

                context.moveToNextActionPhase();
                expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('make the attached unit a leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        groundArena: ['wild-rancor'],
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['fell-the-dragon']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                context.player1.clickCard(context.cartelSpacer);
                context.player1.setDistributeDamagePromptState(new Map([]));

                context.player2.clickCard(context.fellTheDragon);
                expect(context.player2).toBeAbleToSelectExactly([context.wildRancor]);
                context.player2.clickCard(context.wildRancor);
            });
        });

        describe('Leaders with Pilot deploys', function() {
            it('should not give an upgrade on attack ability when deployed as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Asajj Ventress', 'Deploy Asajj Ventress as a Pilot',
                    'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.'
                ]);
                context.player1.clickPrompt('Deploy Asajj Ventress');
                expect(context.asajjVentress.deployed).toBe(true);
                expect(context.asajjVentress.getPower()).toBe(4);

                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give a keyword when deployed as an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        spaceArena: [{ card: 'cartel-spacer', damage: 2 }],
                        resources: 6
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                expect(context.cartelSpacer.damage).toBe(2);
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Asajj Ventress', 'Deploy Asajj Ventress as a Pilot',
                    'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.'
                ]);
                context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.asajjVentress.deployed).toBeTrue();
                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.cartelSpacer.getPower()).toBe(7);
            });

            it('should give an on attack ability to attached unit when deployed as a pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['wampa'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-turncoat']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Asajj Ventress', 'Deploy Asajj Ventress as a Pilot',
                    'Deal 1 damage to a friendly unit. If you do, deal 1 damage to an enemy unit in the same arena.'
                ]);
                context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.passAction();

                // Attack base
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                // Deal 1 damage to friendly Wampa
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                // Deal 1 to enemy Pyke Sentinel
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.damage).toBe(1);

                // Resolve attack
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});