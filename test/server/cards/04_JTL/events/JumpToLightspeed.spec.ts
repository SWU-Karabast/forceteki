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

            it('should be able to return none of the attached upgrades to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        spaceArena: [{ card: 'millennium-falcon#get-out-and-push', upgrades: ['entrenched'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to return multiple attached upgrades to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['protector'] }],
                        spaceArena: [{ card: 'millennium-falcon#get-out-and-push', upgrades: ['entrenched', 'academy-training', 'hardpoint-heavy-blaster'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.academyTraining, context.hardpointHeavyBlaster]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.academyTraining);

                context.player1.clickPrompt('Done');

                expect(context.millenniumFalcon).toBeInZone('hand');
                expect(context.entrenched).toBeInZone('hand');
                expect(context.academyTraining).toBeInZone('hand');
                expect(context.hardpointHeavyBlaster).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            // TODO: Have Ventress begin this test deployed once we add support for it in the test suite
            it('should not be able to return a leader upgrade to hand (leader should be defeated)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
                context.player1.clickCard(context.millenniumFalcon);
                context.player2.passAction();

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.millenniumFalcon).toBeInZone('hand');
                expect(context.asajjVentress).toBeInZone('base');
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose token upgrades but they are removed from the game', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        spaceArena: [{ card: 'millennium-falcon#get-out-and-push', upgrades: ['shield', 'experience'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toBeAbleToSelectExactly([context.shield, context.experience]);
                context.player1.clickCard(context.shield);
                context.player1.clickPrompt('Done');

                expect(context.millenniumFalcon).toBeInZone('hand');
                expect([context.shield, context.experience]).toAllBeInZone('outsideTheGame');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to return upgrades controlled by the opponent to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    },
                    player2: {
                        hand: ['entrenched'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.entrenched);
                context.player2.clickCard(context.millenniumFalcon);

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
                context.player1.clickCard(context.entrenched);
                context.player1.clickPrompt('Done');

                expect(context.millenniumFalcon).toBeInZone('hand');
                expect(context.entrenched).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to return upgrades not attached to the chosen space unit to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push', { card: 'concord-dawn-interceptors', upgrades: ['entrenched'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.millenniumFalcon).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to play a copy of the returned card for free this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1.exhaustedResourceCount).toBe(2); // just the cost of Jump to Lightspeed
            });

            it('should be able to return upgrades attached to a token space unit to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed', 'veteran-fleet-officer', 'entrenched'],
                    }
                });

                const { context } = contextRef;

                // create x-wing and give it entrenched
                context.player1.clickCard(context.veteranFleetOfficer);
                const xwing = context.player1.findCardByName('xwing');

                context.player2.passAction();
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(xwing);
                context.player2.passAction();

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(xwing);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched]);
                context.player1.clickCard(context.entrenched);
                context.player1.clickPrompt('Done');

                expect(xwing).toBeInZone('outsideTheGame');
                expect(context.entrenched).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to play a different card that shares a title for free', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['jump-to-lightspeed', 'millennium-falcon#piece-of-junk'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalconGetOutAndPush);
                context.player2.passAction();
                context.player1.clickCard(context.millenniumFalconPieceOfJunk);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow the opponent to play a copy of the returned card for free', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    },
                    player2: {
                        base: 'chopper-base',
                        hand: ['millennium-falcon#get-out-and-push'],
                        leader: 'leia-organa#alliance-general'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.player1.findCardByName('millennium-falcon#get-out-and-push'));
                context.player2.clickCard(context.player2.findCardByName('millennium-falcon#get-out-and-push'));
                expect(context.player2.exhaustedResourceCount).toBe(3);
            });

            it('should not provide a discount the following turn', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['jump-to-lightspeed'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jumpToLightspeed);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeActivePlayer();
                context.moveToNextActionPhase();
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });
    });
});
