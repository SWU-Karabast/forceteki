
describe('Deploy a Leader as a Pilot', function() {
    integration(function(contextRef) {
        describe('Leaders with Pilot deploys', function() {
            it('can Be deployed as a unit', async function () {
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
                context.player1.clickPrompt('Choose no targets');

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
                context.player1.clickPrompt('Choose no targets');
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
                context.player1.clickPrompt('Choose no targets');

                context.player2.clickCard(context.confiscate);
                expect(context.player2).toBeAbleToSelectExactly([context.bobaFett]);
                context.player2.clickCard(context.bobaFett);

                expect(context.bobaFett).toBeInZone('base');
                expect(context.bobaFett.exhausted).toBe(true);
                expect(context.bobaFett.deployed).toBe(false);

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
                context.player1.clickPrompt('Choose no targets');

                context.player2.clickCard(context.fellTheDragon);
                expect(context.player2).toBeAbleToSelectExactly([context.wildRancor]);
                context.player2.clickCard(context.wildRancor);
            });
        });
    });
});