describe('Regional Governor', function () {
    integration(function (contextRef) {
        describe('Regional Governor\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['regional-governor', 'millennium-falcon#landos-pride'],
                    },
                    player2: {
                        hand: ['millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'green-squadron-awing', 'vanquish', 'change-of-heart', 'palpatines-return', 'triple-dark-raid'],
                        resources: ['millennium-falcon#landos-pride', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        discard: ['millennium-falcon#get-out-and-push', 'consular-security-force'],
                        deck: ['millennium-falcon#piece-of-junk', 'seventh-fleet-defender'],
                    }
                });
            });

            it('should name a card when played', function () {
                const { context } = contextRef;

                // play regional governor and name millennium falcon
                context.player1.clickCard(context.regionalGovernor);
                expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
                context.player1.chooseListOption('Millennium Falcon');
                expect(context.getChatLogs(2)).toContain('player1 names Millennium Falcon using Regional Governor');

                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent the opponent from playing the named card from their hand', function () {
                const { context } = contextRef;

                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
                const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 cannot play any falcon from hand
                expect(context.player2).toBeAbleToSelectNoneOf([player2Falcon1Hand, player2Falcon2Hand]);
                expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should prevent the opponent from playing the named card using Smuggle', function () {
                const { context } = contextRef;

                const player2FalconResources = context.player2.findCardByName('millennium-falcon#landos-pride', 'resource');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 cannot play falcon from resources using smuggle
                expect(player2FalconResources).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should not prevent the opponent from playing other cards', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 can still play a card with a different name
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing).toBeInZone('spaceArena');
            });

            it('should not prevent the controller from playing the named card', function () {
                const { context } = contextRef;

                const player1FalconHand = context.player1.findCardByName('millennium-falcon#landos-pride', 'hand');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                context.player2.passAction();

                // player 1 can still play falcon (no enemy space units so no Ambush prompt)
                context.player1.clickCard(player1FalconHand);
                expect(player1FalconHand).toBeInZone('spaceArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent the named card from being played from the deck', function () {
                const { context } = contextRef;

                const player2FalconDeck = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'deck');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // play triple dark raid, cannot play falcon from the deck
                context.player2.clickCard(context.tripleDarkRaid);
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.seventhFleetDefender],
                    invalid: [player2FalconDeck]
                });
                context.player2.clickCardInDisplayCardPrompt(context.seventhFleetDefender);
                expect(context.seventhFleetDefender).toBeInZone('spaceArena');
            });

            it('should prevent the named card from being played from the discard pile', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // play palpatine's return, cannot play falcon from the discard pile
                context.player2.clickCard(context.palpatinesReturn);
                expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('should still prevent the opponent from playing the named card on the next action phase', function () {
                const { context } = contextRef;

                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
                const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');
                const player2FalconResources = context.player2.findCardByName('millennium-falcon#landos-pride', 'resource');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // the effect lasts while the unit is in play, even on future action phases
                context.moveToNextActionPhase();
                context.player1.passAction();

                expect(context.player2).toBeAbleToSelectNoneOf([player2Falcon1Hand, player2Falcon2Hand, player2FalconResources]);
                expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2FalconResources).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should still prevent that opponent from playing the named card if they take control of it', function () {
                const { context } = contextRef;

                const player1FalconHand = context.player1.findCardByName('millennium-falcon#landos-pride', 'hand');
                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
                const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 takes control of regional governor
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.regionalGovernor);

                // player 1 can still play falcon
                context.player1.clickCard(player1FalconHand);
                expect(player1FalconHand).toBeInZone('spaceArena');

                // but player 2 cannot
                expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should no longer prevent the named card once it leaves play', function () {
                const { context } = contextRef;

                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');

                context.player1.clickCard(context.regionalGovernor);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 defeats regional governor
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.regionalGovernor);

                context.player1.passAction();

                // player 2 can play falcon again
                context.player2.clickCard(player2Falcon1Hand);
                expect(player2Falcon1Hand).toBeInZone('spaceArena');
            });
        });

        it('Regional Governor\'s ability should not prevent a captured copy of the named card from being rescued', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['regional-governor'],
                    spaceArena: [{ card: 'millennium-falcon#landos-pride', capturedUnits: ['millennium-falcon#piece-of-junk'] }]
                },
                player2: {
                    hand: ['vanquish'],
                    resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                }
            });

            const { context } = contextRef;

            const player2Falcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');
            expect(player2Falcon).toBeCapturedBy(context.millenniumFalconLandosPride);

            // play regional governor and name millennium falcon
            context.player1.clickCard(context.regionalGovernor);
            context.player1.chooseListOption('Millennium Falcon');

            // defeat the captor, the captured falcon is rescued rather than played
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.millenniumFalconLandosPride);
            expect(player2Falcon).toBeInZone('spaceArena');
        });

        it('Regional Governor\'s ability should disallow playing a unit as a pilot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['regional-governor'],
                },
                player2: {
                    hand: ['dagger-squadron-pilot'],
                    spaceArena: ['cartel-turncoat']
                }
            });

            const { context } = contextRef;

            // play regional governor and say dagger squadron pilot
            context.player1.clickCard(context.regionalGovernor);
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Dagger Squadron Pilot');
            context.player2.passAction();

            expect(context.daggerSquadronPilot).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
