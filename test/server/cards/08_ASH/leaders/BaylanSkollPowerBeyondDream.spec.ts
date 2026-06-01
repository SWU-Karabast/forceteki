describe('Baylan Skoll, Power Beyond Dream', function () {
    integration(function (contextRef) {
        describe('leader side ability', function () {
            it('should give +2/+2 for this phase on a friendly unit which is alone in its arena (can select both arena)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'baylan-skoll#power-beyond-dream',
                        resources: 1,
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.baylanSkoll.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should give +2/+2 for this phase on a friendly unit which is alone in its arena (ground arena have multiple friendly units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'baylan-skoll#power-beyond-dream',
                        resources: 1,
                        groundArena: ['wampa', 'porg'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing.getPower()).toBe(3);
                expect(context.awing.getHp()).toBe(4);
            });

            it('can be used to soft pass', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'baylan-skoll#power-beyond-dream',
                        resources: 1,
                        groundArena: ['wampa', 'porg'],
                        spaceArena: ['awing', 'mynock']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                expect(context.player1).toHaveNoEffectAbilityPrompt('Give a friendly unit +2/+2 for this phase');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.baylanSkoll.exhausted).toBeTrue();
            });
        });

        describe('leader unit side on attack ability', function () {
            it('should give +2/+2 and Sentinel for this phase on a friendly unit which is alone (leader unit excluded) in its arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'baylan-skoll#power-beyond-dream', deployed: true },
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'porg']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);

                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
                context.player1.passAction();

                context.player2.clickCard(context.porg);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa, context.baylanSkoll]);
                context.player2.clickCard(context.p1Base);
            });

            it('should give +2/+2 and Sentinel for this phase on a friendly unit which is alone (leader unit excluded) in its arena (can select leader unit if he is alone)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'baylan-skoll#power-beyond-dream', deployed: true },
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'porg']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.baylanSkoll, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.baylanSkoll);

                expect(context.player2).toBeActivePlayer();
                expect(context.baylanSkoll.getPower()).toBe(6);
                expect(context.baylanSkoll.getHp()).toBe(8);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.baylanSkoll]);
                context.player2.clickCard(context.baylanSkoll);

                context.moveToNextActionPhase();

                expect(context.baylanSkoll.getPower()).toBe(4);
                expect(context.baylanSkoll.getHp()).toBe(6);
                context.player1.passAction();

                context.player2.clickCard(context.porg);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.baylanSkoll]);
                context.player2.clickCard(context.p1Base);
            });

            it('should give +2/+2 and Sentinel for this phase on a friendly unit which is alone (leader unit excluded) in its arena (ground arena have multiple friendly units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'baylan-skoll#power-beyond-dream', deployed: true },
                        groundArena: ['wampa', 'porg'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        spaceArena: ['tie-fighter']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing.getPower()).toBe(3);
                expect(context.awing.getHp()).toBe(4);

                context.player2.clickCard(context.tieFighter);
                expect(context.player2).toBeAbleToSelectExactly([context.awing]);
                context.player2.clickCard(context.awing);

                context.moveToNextActionPhase();

                expect(context.awing.getPower()).toBe(1);
                expect(context.awing.getHp()).toBe(2);
            });

            it('should not do anything if both arena have multiple friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'baylan-skoll#power-beyond-dream', deployed: true },
                        groundArena: ['wampa', 'porg'],
                        spaceArena: ['awing', 'tie-fighter']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                expect(context.porg.getPower()).toBe(1);
                expect(context.porg.getHp()).toBe(1);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.tieFighter.getPower()).toBe(1);
                expect(context.tieFighter.getHp()).toBe(1);

                expect(context.awing.getPower()).toBe(1);
                expect(context.awing.getHp()).toBe(2);
            });

            it('can be pass', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'baylan-skoll#power-beyond-dream', deployed: true },
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'porg']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkoll);
                context.player1.clickCard(context.p2Base);
                context.player1.passAction();

                expect(context.player2).toBeActivePlayer();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                expect(context.awing.getPower()).toBe(1);
                expect(context.awing.getHp()).toBe(2);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
