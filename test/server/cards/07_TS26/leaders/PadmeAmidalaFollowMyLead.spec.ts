describe('Padme Amidala, Follow My Lead', function() {
    integration(function(contextRef) {
        describe('Padme Amidala\'s undeployed ability', function() {
            const abilityText = 'Attack with a friendly unit that entered play this phase even if it\'s exhausted. It can\'t attack bases for this attack';

            it('should attack with a friendly unit that entered play this phase even it it is exhausted. It cannot attack base for this attack. (only if 2 or more friendly units have entered play this phase)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        hand: ['atst', 'restored-arc170'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['consular-security-force'],
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player2.clickCard(context.consularSecurityForce);

                context.player1.clickCard(context.restoredArc170);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt(abilityText);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.restoredArc170]);
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('discard', context.player2);
            });

            it('should attack with a friendly unit that entered play this phase even it it is exhausted. It cannot attack base for this attack. (token unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['veteran-fleet-officer'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);

                const xwing = context.player1.findCardByName('xwing');
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
                context.player1.clickCard(xwing);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('does not attack when only 1 unit has entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['awing'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('does not attack when 2 units entered play but one was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        hand: ['lothwolf', 'porg'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lothwolf);
                context.player2.passAction();
                context.player1.clickCard(context.porg);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('has no effect when no units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        resources: 4,
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('does not count a unit that entered play under friendly control but is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        base: 'chopper-base',
                        resources: 4,
                        hand: ['galen-erso#destroying-his-creation', 'porg'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                context.player1.clickCard(context.porg);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHaveNoEffectAbilityPrompt(abilityText);
                context.player1.clickPrompt('Use it anyway');

                expect(context.padmeAmidala.exhausted).toBeTrue();
            });

            it('counts a unit that entered play under enemy control but is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        hand: ['populist-advisor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['yoda#old-master']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.populistAdvisor);

                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt(abilityText);

                expect(context.player1).toBeAbleToSelectExactly([context.populistAdvisor, context.galenErso]);
                context.player1.clickCard(context.galenErso);
                context.player1.clickCard(context.yoda);

                expect(context.padmeAmidala.exhausted).toBeTrue();
                expect(context.galenErso.damage).toBe(2);
            });
        });

        describe('Padme Amidala\'s deployed ability', function() {
            it('should attack with a friendly unit that entered play this phase even it it is exhausted. It cannot attack base for this attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#follow-my-lead',
                        hand: ['yoda#old-master'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt('Deploy Padmé Amidala');
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);
                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('discard', context.player2);
                expect(context.yoda.damage).toBe(1);
            });

            it('should attack with a friendly unit that entered play this phase even it it is exhausted. It cannot attack base for this attack (token unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['veteran-fleet-officer'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.veteranFleetOfficer);
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                const xwing = context.player1.findCardByName('xwing');
                expect(context.player1).toBeAbleToSelectExactly([context.veteranFleetOfficer, xwing]);
                context.player1.clickCard(xwing);
                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(xwing.damage).toBe(1);
            });

            it('is skipped when no other friendly units have entered play this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('is skipped when the only unit that entered play was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['lothwolf'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lothwolf);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lothwolf);

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('does not count a unit that entered play under friendly control but is now under enemy control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('counts a unit that entered play under enemy control but is now under friendly control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#follow-my-lead', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: 'chopper-base',
                        groundArena: ['yoda#old-master'],
                        hand: ['galen-erso#destroying-his-creation']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.galenErso);
                context.player2.clickPrompt('Trigger');

                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.galenErso]);
                context.player1.clickCard(context.galenErso);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.galenErso.damage).toBe(2);
            });
        });
    });
});
