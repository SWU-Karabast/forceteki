
describe('Boba Fett, Any Methods Necessary', function() {
    integration(function(contextRef) {
        describe('Boba Fett, Any Methods Necessary\'s undeployed ability', function() {
            it('should allow him to be exhausted when dealing non-combat damage in order to do 1 indirect damage to a player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        hand: ['daring-raid'],
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                expect(context.player1).toHaveExactPromptButtons(['Trigger', 'Pass']);
                context.player1.clickPrompt('Trigger');
                context.player1.clickPrompt('Opponent');

                expect(context.player2).toHavePrompt('Distribute 1 indirect damage among targets');

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                expect(context.player2).not.toHaveChooseNoTargetButton();
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.wampa, 1]
                ]));

                expect(context.wampa.damage).toBe(1);
                expect(context.p2Base.damage).toBe(2);
                expect(context.bobaFett.exhausted).toBe(true);
            });

            it('should not allow him to be exhausted when dealing combat damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        hand: ['daring-raid'],
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');

                expect(context.player2).toBeActivePlayer();
                expect(context.bobaFett.exhausted).toBe(false);
            });

            it('should not allow him to be exhausted when dealing Overwhelm damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        groundArena: ['wampa'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');

                expect(context.player2).toBeActivePlayer();
                expect(context.bobaFett.exhausted).toBe(false);
            });

            it('does not deal 4 damage when deployed as a unit', async function () {
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

                expect(context.player2).toBeActivePlayer();
            });

            it('will deal up to 4 damage divided among units when deployed as an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer', 'auzituck-liberator-gunship'],
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
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.auzituckLiberatorGunship]);
                context.player1.clickCard(context.auzituckLiberatorGunship);

                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('spaceArena');
                expect(context.auzituckLiberatorGunship.getPower()).toBe(7);
                expect(context.auzituckLiberatorGunship.getHp()).toBe(8);
                expect(context.auzituckLiberatorGunship).toHaveExactUpgradeNames(['boba-fett#any-methods-necessary']);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.auzituckLiberatorGunship, context.wampa, context.moistureFarmer, context.concordDawnInterceptors]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.wampa, 2],
                    [context.concordDawnInterceptors, 1],
                    [context.cartelSpacer, 1],
                ]));

                expect(context.wampa.damage).toBe(2);
                expect(context.moistureFarmer.damage).toBe(0);
                expect(context.concordDawnInterceptors.damage).toBe(1);
                expect(context.cartelSpacer.damage).toBe(1);

                context.player2.clickCard(context.rivalsFall);
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.auzituckLiberatorGunship, context.wampa, context.moistureFarmer, context.concordDawnInterceptors]);
                context.player2.clickCard(context.auzituckLiberatorGunship);

                expect(context.auzituckLiberatorGunship).toBeInZone('discard');
                expect(context.bobaFett).toBeInZone('base');
                expect(context.bobaFett.exhausted).toBe(true);
                expect(context.bobaFett.deployed).toBe(false);

                context.moveToNextActionPhase();
                expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});