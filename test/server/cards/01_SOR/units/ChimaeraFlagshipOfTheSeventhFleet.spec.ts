describe('Chimaera, Flagship of the Seventh Fleet', function () {
    integration(function (contextRef) {
        describe('Chimaera\'s ability', function () {
            it('should allow the controller to choose a card title, then reveal the opponent\'s hand and force them to choose a card with matching title to discard', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#flagship-of-the-seventh-fleet']
                    },
                    player2: {
                        hand: ['vanquish', 'millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'wampa']
                    }
                });

                const { context } = contextRef;

                const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
                const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toHaveExactDropdownListOptions(context.getAllCardTitles());
                context.player1.chooseListOption('Millennium Falcon');
                expect(context.getChatLogs(1)).toContain('player1 reveals Wampa, Millennium Falcon, Millennium Falcon, Vanquish due to Chimaera');
                expect(context.player2).toBeAbleToSelectExactly([falcon1, falcon2]);
                context.player2.clickCard(falcon1);

                expect(falcon1).toBeInZone('discard');
                expect(falcon2).toBeInZone('hand');
                expect(context.vanquish).toBeInZone('hand');
                expect(context.wampa).toBeInZone('hand');

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to choose a card title, then reveal the opponent\'s hand and automatically discard the only card with matching title', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#flagship-of-the-seventh-fleet']
                    },
                    player2: {
                        hand: ['vanquish', 'millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'wampa']
                    }
                });

                const { context } = contextRef;

                const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
                const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toHaveExactDropdownListOptions(context.getAllCardTitles());
                context.player1.chooseListOption('Wampa');
                expect(context.getChatLogs(1)).toContain('player1 reveals Wampa, Millennium Falcon, Millennium Falcon, Vanquish due to Chimaera');

                expect(falcon1).toBeInZone('hand');
                expect(falcon2).toBeInZone('hand');
                expect(context.vanquish).toBeInZone('hand');
                expect(context.wampa).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to choose a card title, then reveal the opponent\'s hand and do nothing if no card title matches', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#flagship-of-the-seventh-fleet']
                    },
                    player2: {
                        hand: ['vanquish', 'millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'wampa']
                    }
                });

                const { context } = contextRef;

                const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
                const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toHaveExactDropdownListOptions(context.getAllCardTitles());
                context.player1.chooseListOption('Resupply');
                expect(context.getChatLogs(1)).toContain('player1 reveals Wampa, Millennium Falcon, Millennium Falcon, Vanquish due to Chimaera');

                expect(falcon1).toBeInZone('hand');
                expect(falcon2).toBeInZone('hand');
                expect(context.vanquish).toBeInZone('hand');
                expect(context.wampa).toBeInZone('hand');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
