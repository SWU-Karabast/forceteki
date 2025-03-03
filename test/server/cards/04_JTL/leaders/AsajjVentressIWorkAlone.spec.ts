
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
                expect(context.asajjVentress.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            // it('should not allow him to be exhausted when dealing combat damage', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'asajj-ventress#i-work-alone',
            //             hand: ['daring-raid'],
            //             spaceArena: ['cartel-spacer'],
            //             resources: 6
            //         },
            //         player2: {
            //             groundArena: ['wampa'],
            //             hand: ['rivals-fall']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.cartelSpacer);
            //     context.player1.clickCard(context.p2Base);
            //     expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');

            //     expect(context.player2).toBeActivePlayer();
            //     expect(context.bobaFett.exhausted).toBe(false);
            // });

            // it('does not deal 4 damage when deployed as a unit', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'boba-fett#any-methods-necessary',
            //             spaceArena: ['cartel-spacer'],
            //             resources: 6
            //         },
            //         player2: {
            //             hand: ['rivals-fall']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.bobaFett);
            //     expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
            //     context.player1.clickPrompt('Deploy Boba Fett');
            //     expect(context.bobaFett.deployed).toBe(true);

            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('will deal up to 4 damage divided among units when deployed as an upgrade', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'boba-fett#any-methods-necessary',
            //             spaceArena: ['cartel-spacer'],
            //             resources: 6
            //         },
            //         player2: {
            //             groundArena: ['wampa', 'moisture-farmer'],
            //             spaceArena: ['concord-dawn-interceptors'],
            //             hand: ['rivals-fall']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.bobaFett);
            //     expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
            //     context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
            //     expect(context.player2).not.toBeActivePlayer();
            //     expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
            //     context.player1.clickCard(context.cartelSpacer);

            //     expect(context.bobaFett.deployed).toBe(true);
            //     expect(context.bobaFett).toBeInZone('spaceArena');
            //     expect(context.cartelSpacer.getPower()).toBe(6);
            //     expect(context.cartelSpacer.getHp()).toBe(7);

            //     expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa, context.moistureFarmer, context.concordDawnInterceptors]);
            //     expect(context.player1).toHaveChooseNoTargetButton();
            //     context.player1.setDistributeDamagePromptState(new Map([
            //         [context.wampa, 2],
            //         [context.concordDawnInterceptors, 1],
            //         [context.cartelSpacer, 1],
            //     ]));

            //     expect(context.wampa.damage).toBe(2);
            //     expect(context.moistureFarmer.damage).toBe(0);
            //     expect(context.concordDawnInterceptors.damage).toBe(1);
            //     expect(context.cartelSpacer.damage).toBe(1);

            //     context.player2.clickCard(context.rivalsFall);
            //     expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa, context.moistureFarmer, context.concordDawnInterceptors]);
            //     context.player2.clickCard(context.cartelSpacer);

            //     expect(context.cartelSpacer).toBeInZone('discard');
            //     expect(context.bobaFett).toBeInZone('base');
            //     expect(context.bobaFett.exhausted).toBe(true);
            //     expect(context.bobaFett.deployed).toBe(false);

            //     context.moveToNextActionPhase();
            //     expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            // });
        });
    });
});