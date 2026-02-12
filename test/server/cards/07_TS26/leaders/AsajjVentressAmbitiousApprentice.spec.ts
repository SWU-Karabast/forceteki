describe('Asajj Ventress, Ambitious Apprentice', function() {
    integration(function(contextRef) {
        describe('Asajj Ventress\'s undeployed ability ', function() {
            it('should allow attacking with a token unit that gets +1/+0 for the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#ambitious-apprentice',
                        groundArena: [{ card: 'wampa', upgrades: ['experience', 'shield'] }, 'spy', 'clone-trooper', 'battle-droid'],
                        spaceArena: ['xwing', 'tie-fighter'],
                        base: 'echo-base',
                        credits: 1,
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a token unit. It gets +1/+0 for this attack.');
                // wampa should not be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.spy, context.cloneTrooper, context.battleDroid, context.xwing, context.tieFighter]);
                context.player1.clickCard(context.spy);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
                expect(context.spy.getPower()).toBe(0);
                expect(context.spy.exhausted).toBeTrue();
            });

            it('should allow attacking with a token unit that gets +1/+0 for the attack (cannot select enemy token unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#ambitious-apprentice',
                        groundArena: ['spy'],
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a token unit. It gets +1/+0 for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.spy]);
                context.player1.clickCard(context.spy);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
                expect(context.spy.getPower()).toBe(0);
                expect(context.spy.exhausted).toBeTrue();
            });

            it('should allow attacking with a token unit that gets +1/+0 for the attack (cannot select exhausted token unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#ambitious-apprentice',
                        groundArena: [{ card: 'spy', exhausted: true }],
                        spaceArena: ['xwing'],
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Attack with a token unit. It gets +1/+0 for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.xwing]);
                context.player1.clickCard(context.xwing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
                expect(context.xwing.getPower()).toBe(2);
                expect(context.xwing.exhausted).toBeTrue();
            });

            it('should notallow attacking with a non-token unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#ambitious-apprentice',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toHaveEnabledPromptButton('(No effect) Attack with a token unit. It gets +1/+0 for this attack.');
                context.player1.clickPrompt('(No Effect) Attack with a token unit. It gets +1/+0 for this attack.');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(0);
            });
        });

        describe('Asajj Ventress\'s deployed ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#ambitious-apprentice', deployed: true },
                        hand: ['i-am-the-senate'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['droid-deployment'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.iAmTheSenate);
                context.player2.clickCard(context.droidDeployment);
                context.moveToNextActionPhase();
            });

            it('should not get +2/+0 when a non-token unit has attacked this phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                expect(context.asajjVentress.getPower()).toBe(3);
                expect(context.asajjVentress.remainingHp).toBe(5);
            });

            it('should not get +2/+0 when a enemy token unit has attacked this phase', function() {
                const { context } = contextRef;

                context.player1.passAction();
                const droids = context.player2.findCardsByName('battle-droid');
                context.player2.clickCard(droids[0]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();

                expect(context.asajjVentress.getPower()).toBe(3);
                expect(context.asajjVentress.remainingHp).toBe(5);
            });

            it('should get +2/+0 for this phase when a token unit has attacked this phase', function() {
                const { context } = contextRef;

                const spies = context.player1.findCardsByName('spy');
                context.player1.clickCard(spies[0]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                expect(context.asajjVentress.getPower()).toBe(5);
                expect(context.asajjVentress.remainingHp).toBe(5);

                context.player2.passAction();
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.getPower()).toBe(5);
                expect(context.asajjVentress.remainingHp).toBe(5);

                context.moveToNextActionPhase();

                expect(context.asajjVentress.getPower()).toBe(3);
                expect(context.asajjVentress.remainingHp).toBe(5);
            });
        });
    });
});
