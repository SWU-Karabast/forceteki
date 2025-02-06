describe('Regional Governor', function () {
    integration(function (contextRef) {
        it('Regional Governor\'s ability should name a card and opponent can\'t play named cards', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['regional-governor', 'millennium-falcon#landos-pride', 'millennium-falcon#get-out-and-push'],
                },
                player2: {
                    hand: ['millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'green-squadron-awing', 'vanquish', 'change-of-heart'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            const falcon1 = context.player1.findCardByName('millennium-falcon#landos-pride');
            const falcon2 = context.player1.findCardByName('millennium-falcon#get-out-and-push');
            const falcon3 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
            const falcon4 = context.player2.findCardByName('millennium-falcon#landos-pride');

            // play regional governor and say millenium falcon
            context.player1.clickCard(context.regionalGovernor);
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');

            expect(context.player2).toBeActivePlayer();

            // player 2 cannot play any falcon
            expect(falcon4).not.toHaveAvailableActionWhenClickedBy(context.player2);
            expect(falcon3).not.toHaveAvailableActionWhenClickedBy(context.player2);

            // but he can play others unit
            context.player2.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing).toBeInZone('spaceArena');

            // player 1 can still play falcon
            context.player1.clickCard(falcon1);
            context.player1.clickPrompt('Pass');
            expect(falcon1).toBeInZone('spaceArena');

            context.moveToNextActionPhase();
            context.player1.passAction();

            // player 2 takes control of regional governor
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.regionalGovernor);

            // player 1 can still play falcon
            context.player1.clickCard(falcon2);

            // but player 2 cannot
            expect(falcon4).not.toHaveAvailableActionWhenClickedBy(context.player2);
            expect(falcon3).not.toHaveAvailableActionWhenClickedBy(context.player2);

            context.moveToNextActionPhase();
            context.player1.passAction();

            // player 2 kill regional governor
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.regionalGovernor);

            context.player1.passAction();

            // player 2 can play falcon
            context.player2.clickCard(falcon3);
            expect(falcon3).toBeInZone('spaceArena');
        });
    });
});
