
describe('Asajj Ventress, I Work Alone', function() {
    integration(function(contextRef) {
        describe('Asajj Ventress, I Work Alone\'s undeployed ability', function() {
            it('should deal 1 damage to a friendly unit and then 1 damage to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        spaceArena: ['cartel-spacer'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Click Asajj and select a friendly unit
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.damage).toBe(1);

                // Now, select an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing]);
                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.damage).toBe(1);

                expect(context.asajjVentress.exhausted).toBe(true);
            });

            it('should deal 1 damage to a friendly unit even if there is no enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        groundArena: ['wampa'],
                        resources: 4
                    },
                });

                const { context } = contextRef;

                // Click Asajj and select a friendly unit
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.asajjVentress.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to enemy unit even if the friendly unit is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        groundArena: ['superlaser-technician'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Click Asajj and select a friendly unit
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician]);
                context.player1.clickCard(context.superlaserTechnician);

                // Now, select an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                context.player1.clickPrompt('Trigger'); // SLT ability
                expect(context.asajjVentress.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to enemy unit even if the friendly unit has a shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        groundArena: [{ card: 'superlaser-technician', upgrades: ['shield'] }],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Click Asajj and select a friendly unit
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician]);
                context.player1.clickCard(context.superlaserTechnician);

                // Now, select an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                expect(context.asajjVentress.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal 1 damage to an enemy unit if there is no friendly unit to deal 1 damage to', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        resources: 4
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Click Asajj and select a friendly unit
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Use it anyway');
                expect(context.asajjVentress.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Asajj Ventress, I Work Alone\'s deployed ability', function() {
            it('should have grit when deployed as a ground unit', async function () {
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
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.asajjVentress);
                expect(context.asajjVentress.damage).toBe(2);
                expect(context.asajjVentress.getPower()).toBe(6);
            });

            it('should not have an on attack ability when deployed as a unit', async function () {
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

            it('should give grit to attached unit when deployed as a pilot', async function () {
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

            it('should deal 1 damage to enemy unit even if the friendly unit is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['superlaser-technician'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['wampa'],
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

                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.cartelSpacer]);
                context.player1.clickCard(context.superlaserTechnician);

                // Now, select an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                context.player1.clickPrompt('Trigger'); // SLT ability

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to enemy unit even if the friendly unit has a shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        spaceArena: ['cartel-spacer'],
                        groundArena: [{ card: 'superlaser-technician', upgrades: ['shield'] }],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['wampa'],
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

                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.cartelSpacer]);
                context.player1.clickCard(context.superlaserTechnician);

                // Now, select an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});