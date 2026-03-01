describe('Transmission Jamming', function () {
    integration(function (contextRef) {
        it('Transmission Jammings\'s ability should name a card and players can\'t play named cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['transmission-jamming', 'millennium-falcon#landos-pride', 'millennium-falcon#get-out-and-push', 'take-captive'],
                },
                player2: {
                    hand: ['millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'green-squadron-awing', 'vanquish', 'change-of-heart', 'palpatines-return', 'triple-dark-raid'],
                    resources: ['millennium-falcon#landos-pride', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    discard: ['millennium-falcon#get-out-and-push', 'consular-security-force'],
                    deck: ['millennium-falcon#piece-of-junk', 'seventh-fleet-defender'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            const player1Falcon2Hand = context.player1.findCardByName('millennium-falcon#landos-pride');
            const player1Falcon4Hand = context.player1.findCardByName('millennium-falcon#get-out-and-push');
            const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
            const player2Falcon1Deck = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'deck');
            const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');
            const player2Falcon2Resources = context.player2.findCardByName('millennium-falcon#landos-pride', 'resource');

            // play transmission jamming and say millenium falcon
            context.player1.clickCard(context.transmissionJamming);
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');
            expect(context.getChatLogs(3)).toContain('player1 names Millennium Falcon using Transmission Jamming');

            expect(context.player2).toBeActivePlayer();

            // player 2 cannot play any falcon (nor from smuggle)
            expect(context.player2).toBeAbleToSelectNoneOf([player2Falcon1Hand, player2Falcon2Hand, player2Falcon2Resources]);
            expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
            expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
            expect(player2Falcon2Resources).not.toHaveAvailableActionWhenClickedBy(context.player2);

            // but he can play other units
            context.player2.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing).toBeInZone('spaceArena');

            // player 1 cannot play falcon
            expect(context.player1).toBeAbleToSelectNoneOf([player1Falcon4Hand, player1Falcon2Hand]);
            expect(player1Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player1);
            expect(player1Falcon4Hand).not.toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.passAction();

            // play triple dark raid, cannot play falcon
            context.player2.clickCard(context.tripleDarkRaid);
            expect(context.player2).toHaveExactDisplayPromptCards({
                selectable: [context.seventhFleetDefender],
                invalid: [player2Falcon1Deck]
            });
            context.player2.clickCardInDisplayCardPrompt(context.seventhFleetDefender);
            expect(context.seventhFleetDefender).toBeInZone('spaceArena');

            // play palpatine's return, cannot play falcon in discard
            context.player1.passAction();
            context.player2.clickCard(context.palpatinesReturn);
            expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player2.clickCard(context.consularSecurityForce);
            expect(context.consularSecurityForce).toBeInZone('groundArena');

            context.moveToNextActionPhase();

            context.player1.passAction();

            // player 2 can play falcon
            context.player2.clickCard(player2Falcon1Hand);
            expect(player2Falcon1Hand).toBeInZone('spaceArena');

            // player 1 can play falcon
            context.player1.clickCard(player1Falcon2Hand);
            context.player1.clickPrompt('Pass');
        });

        it('Transmision Jamming\'s ability should disallow playing a unit as a pilot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['transmission-jamming'],
                },
                player2: {
                    hand: ['dagger-squadron-pilot'],
                    spaceArena: ['cartel-turncoat']
                }
            });

            const { context } = contextRef;

            // play transmission jamming and say dagger squadron pilot
            context.player1.clickCard(context.transmissionJamming);
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Dagger Squadron Pilot');
            context.player2.passAction();

            expect(context.daggerSquadronPilot).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});