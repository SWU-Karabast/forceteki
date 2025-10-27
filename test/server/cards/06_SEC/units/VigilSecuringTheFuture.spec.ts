describe('Vigil, Securing the Future', function() {
    integration(function(contextRef) {
        describe('Vigil\'s ability', function() {
            // it('should not reduce combat damage dealt to base', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future']
            //         },
            //         player2: {
            //             spaceArena: ['alliance-xwing']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.allianceXwing);
            //     context.player2.clickCard(context.p1Base);

            //     expect(context.p1Base.damage).toBe(2);
            // });

            // it('should reduce combat damage dealt to friendly non-Vigil units by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
            //         },
            //         player2: {
            //             spaceArena: ['alliance-xwing']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.allianceXwing);
            //     context.player2.clickCard(context.cartelSpacer);

            //     expect(context.cartelSpacer.damage).toBe(1);
            //     expect(context.allianceXwing.damage).toBe(2);
            // });

            // it('should reduce enemy card ability damage dealt to friendly non-Vigil units by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
            //         },
            //         player2: {
            //             hand: ['daring-raid']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.daringRaid);
            //     context.player2.clickCard(context.cartelSpacer);

            //     expect(context.cartelSpacer.damage).toBe(1);
            // });

            // it('should reduce friendly card ability damage dealt to friendly non-Vigil units by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future', 'cartel-spacer'],
            //             hand: ['daring-raid']
            //         },
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.daringRaid);
            //     context.player1.clickCard(context.cartelSpacer);

            //     expect(context.cartelSpacer.damage).toBe(1);
            // });

            // it('should not reduce indirect damage dealt to friendly non-Vigil units', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
            //         },
            //         player2: {
            //             hand: ['torpedo-barrage']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.torpedoBarrage);
            //     context.player2.clickPrompt('Deal indirect damage to opponent');
            //     context.player1.setDistributeIndirectDamagePromptState(new Map([
            //         [context.p1Base, 3],
            //         [context.cartelSpacer, 2],
            //     ]));

            //     expect(context.cartelSpacer.damage).toBe(2);
            //     expect(context.p1Base.damage).toBe(3);
            // });

            // it('should increase combat damage dealt to Vigil by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future']
            //         },
            //         player2: {
            //             spaceArena: ['alliance-xwing']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.allianceXwing);
            //     context.player2.clickCard(context.vigil);

            //     expect(context.vigil.damage).toBe(3);
            //     expect(context.allianceXwing).toBeInZone('discard');
            // });

            // it('should increase enemy card ability damage dealt to Vigil by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future']
            //         },
            //         player2: {
            //             hand: ['daring-raid']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.daringRaid);
            //     context.player2.clickCard(context.vigil);

            //     expect(context.vigil.damage).toBe(3);
            // });

            // it('should increase friendly card ability damage dealt to Vigil by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future'],
            //             hand: ['daring-raid']
            //         },
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.daringRaid);
            //     context.player1.clickCard(context.vigil);

            //     expect(context.vigil.damage).toBe(3);
            // });

            // it('should increase indirect damage dealt to Vigil by 1', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: ['vigil#securing-the-future']
            //         },
            //         player2: {
            //             hand: ['torpedo-barrage']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.torpedoBarrage);
            //     context.player2.clickPrompt('Deal indirect damage to opponent');
            //     context.player1.setDistributeIndirectDamagePromptState(new Map([
            //         [context.vigil, 5]
            //     ]));

            //     expect(context.vigil.damage).toBe(6);
            // });

            // it('should not error if indirect is increassed beyond Vigil\'s max health', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             spaceArena: [{ card: 'vigil#securing-the-future', damage: 4 }]
            //         },
            //         player2: {
            //             hand: ['torpedo-barrage']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.passAction();
            //     context.player2.clickCard(context.torpedoBarrage);
            //     context.player2.clickPrompt('Deal indirect damage to opponent');
            //     context.player1.setDistributeIndirectDamagePromptState(new Map([
            //         [context.vigil, 5]
            //     ]));

            //     expect(context.vigil).toBeInZone('discard');
            //     expect(context.player1).toBeActivePlayer();
            // });

            it('should stack multiple reductions correctly', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor', 'shield'] }],
                        spaceArena: ['vigil#securing-the-future', 'cartel-spacer']
                    },
                    player2: {
                        hand: ['open-fire']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.bobaFett);

                expect(context.player1).toHaveExactPromptButtons([
                    'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
                    'Defeat shield to prevent attached unit from taking damage',
                    'Reduce all damage dealt to friendly non-Vigil units by 1'
                ]);

                context.player1.clickPrompt('If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage');
                context.player1.clickPrompt('Reduce all damage dealt to friendly non-Vigil units by 1');

                expect(context.player1).toBeActivePlayer();
                expect(context.bobaFett.damage).toBe(0);
                expect(context.shield).toBeAttachedTo(context.bobaFett);
            });
        });
    });
});