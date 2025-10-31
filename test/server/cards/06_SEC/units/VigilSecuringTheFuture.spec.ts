describe('Vigil, Securing the Future', function() {
    integration(function(contextRef) {
        describe('Vigil\'s ability', function() {
            it('should not reduce combat damage dealt to base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.allianceXwing);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(2);
            });

            it('should reduce combat damage dealt to friendly non-Vigil units by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.allianceXwing);
                context.player2.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.allianceXwing.damage).toBe(2);
            });

            it('should reduce enemy card ability damage dealt to friendly non-Vigil units by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should reduce friendly card ability damage dealt to friendly non-Vigil units by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future', 'cartel-spacer'],
                        hand: ['daring-raid']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should not reduce indirect damage dealt to friendly non-Vigil units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
                    },
                    player2: {
                        hand: ['torpedo-barrage']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 2],
                    [context.cartelSpacer, 2],
                    [context.vigil, 1]
                ]));

                context.player1.clickPrompt('Increase all damage dealt to Vigil by another card by 1');

                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.p1Base.damage).toBe(2);
                expect(context.vigil.damage).toBe(2);
            });

            it('should not increase damage dealt to Vigil if the damage was reduced to 0 first', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['finn#on-the-run'],
                        spaceArena: ['vigil#securing-the-future']
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                // Use Finn to protect Vigil
                context.player1.clickCard(context.vigil);

                context.player2.clickCard(context.concordDawnInterceptors);
                context.player2.clickCard(context.vigil);

                expect(context.player1).toHaveExactPromptButtons([
                    'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                    'Increase all damage dealt to Vigil by another card by 1'
                ]);

                context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');

                expect(context.player1).toBeActivePlayer();
                expect(context.vigil.damage).toBe(0);
            });

            it('should not increase damage dealt to Vigil by itself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'vigil#securing-the-future', upgrades: ['paige-tico#dropping-the-hammer'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vigil);
                context.player1.clickCard(context.p2Base);
                expect(context.vigil.damage).toBe(1);
            });

            it('should increase combat damage dealt to Vigil by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.allianceXwing);
                context.player2.clickCard(context.vigil);

                expect(context.vigil.damage).toBe(3);
                expect(context.allianceXwing).toBeInZone('discard');
            });

            it('should increase enemy card ability damage dealt to Vigil by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future']
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.vigil);

                expect(context.vigil.damage).toBe(3);
            });

            it('should increase friendly card ability damage dealt to Vigil by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future'],
                        hand: ['daring-raid']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.vigil);

                expect(context.vigil.damage).toBe(3);
            });

            it('should increase indirect damage dealt to Vigil by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil#securing-the-future']
                    },
                    player2: {
                        hand: ['torpedo-barrage']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.vigil, 5]
                ]));

                expect(context.vigil.damage).toBe(6);
            });

            it('should not error if indirect is increassed beyond Vigil\'s max health', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'vigil#securing-the-future', damage: 4 }]
                    },
                    player2: {
                        hand: ['torpedo-barrage']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.vigil, 5]
                ]));

                expect(context.vigil).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});