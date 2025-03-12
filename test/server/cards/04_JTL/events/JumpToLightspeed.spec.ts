describe('Jump to Lightspeed', function() {
    integration(function(contextRef) {
        describe('Jump to Lightspeed\'s ability', function() {
            it('should return a friendly space unit to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                expect(context.player1).toBeAbleToSelectExactly([context.millenniumFalcon]);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.millenniumFalcon).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            // it('should be able to return none of the attached upgrades to hand', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: [{ card: 'millennium-falcon#get-out-and-push', upgrades: ['entrenched'] }]
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
            //     expect(context.player).toHavePassAbilityButton();
            //     context.player1.clickPrompt('Pass');
            //     expect(context.player2).toBeActivePlayer();
            // });

            // // TODO: Have Ventress begin this test deployed once we add support for it in the test suite
            // it('should not be able to return a leader upgrade to hand (leader should be defeated)', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'asajj-ventress#i-work-alone',
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: ['millennium-falcon#get-out-and-push']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.asajjVentress);
            //     context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
            //     context.player1.clickCard(context.millenniumFalcon);
            //     context.player2.passAction();

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.millenniumFalcon).toBeInZone('hand');
            //     expect(context.asajjVentress).toBeInZone('base');
            //     expect(context.asajjVentress.exhausted).toBeTrue();
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should not be able to return token upgrades to hand', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: [{ card: 'millennium-falcon#get-out-and-push', upgrades: ['shield', 'experience'] }]
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.millenniumFalcon).toBeInZone('hand');
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should be able to return upgrades controlled by the opponent to hand', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: [{ card: 'millennium-falcon#get-out-and-push', upgrades: [{ card: 'entrenched', ownerAndController: 'player2' }] }]
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
            //     context.player1.clickCard(context.entrenched);
            //     expect(context.millenniumFalcon).toBeInZone('hand');
            //     expect(context.entrenched).toBeInZone('hand', context.player2);
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should not be able to return upgrades not attached to the chosen space unit to hand', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: ['millennium-falcon#get-out-and-push', { card: 'concord-dawn-interceptors', upgrades: ['entrenched'] }]
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.millenniumFalcon).toBeInZone('hand');
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should be able to play a copy of the returned card for free this phase', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: ['millennium-falcon#get-out-and-push']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.player2).toBeActivePlayer();
            //     context.player2.passAction();
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.player1.exhaustedResourceCount).toBe(0);
            // });

            // it('should be able to select but not return a token space unit to hand', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: ['tie-fighter']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.tieFighter);
            //     expect(context.tieFighter).toBeInZone('outOfPlay');
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should be able to return upgrades attached to a token space unit to hand', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: [{ card: 'tie-fighter', upgrades: ['entrenched'] }]
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.tieFighter);
            //     expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
            //     context.player1.clickCard(context.entrenched);
            //     expect(context.tieFighter).toBeInZone('outOfPlay');
            //     expect(context.entrenched).toBeInZone('hand');
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should not be able to play a different card that shares a title for free', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'han-solo#audacious-smuggler',
            //             hand: ['jump-to-lightspeed', 'millennium-falcon#piece-of-junk'],
            //             spaceArena: ['millennium-falcon#get-out-and-push']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalconGetOutAndPush);
            //     context.player2.passAction();
            //     context.player1.clickCard(context.millenniumFalconPieceOfJunk);
            //     expect(context.player1.exhaustedResourceCount).toBe(3);
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should not allow the opponent to play a copy of the returned card for free', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: ['millennium-falcon#get-out-and-push']
            //         },
            //         player2: {
            //             hand: ['millennium-falcon#get-out-and-push']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.player1.findCardByName('millennium-falcon#get-out-and-push'));
            //     context.player2.clickCard(context.player2.findCardByName('millennium-falcon#get-out-and-push'));
            //     expect(context.player2.exhaustedResourceCount).not.toBe(0);
            //     expect(context.player2).toBeActivePlayer();
            // });

            // it('should not provide a discount the following turn', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['jump-to-lightspeed'],
            //             spaceArena: ['millennium-falcon#get-out-and-push']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.jumpToLightspeed);
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.player2).toBeActivePlayer();
            //     context.moveToNextActionPhase();
            //     context.player1.clickCard(context.millenniumFalcon);
            //     expect(context.player1.exhaustedResourceCount).toBe(3);
            // });
        });
    });
});
