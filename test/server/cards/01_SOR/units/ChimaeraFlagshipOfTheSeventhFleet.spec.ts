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
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
                const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
                context.player1.chooseListOption('Millennium Falcon');

                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.vanquish, falcon1, falcon2, context.wampa]);
                expect(context.getChatLogs(1)[0]).toContain(context.vanquish.title);
                expect(context.getChatLogs(1)[0]).toContain(falcon1.title);
                expect(context.getChatLogs(1)[0]).toContain(falcon2.title);
                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                context.player1.clickPrompt('Done');

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
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
                const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
                context.player1.chooseListOption('Wampa');

                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.vanquish, falcon1, falcon2, context.wampa]);
                expect(context.getChatLogs(1)[0]).toContain(context.vanquish.title);
                expect(context.getChatLogs(1)[0]).toContain(falcon1.title);
                expect(context.getChatLogs(1)[0]).toContain(falcon2.title);
                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                context.player1.clickPrompt('Done');

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
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
                const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

                context.player1.clickCard(context.chimaera);
                expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
                context.player1.chooseListOption('Resupply');

                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.vanquish, falcon1, falcon2, context.wampa]);
                expect(context.getChatLogs(1)[0]).toContain(context.vanquish.title);
                expect(context.getChatLogs(1)[0]).toContain(falcon1.title);
                expect(context.getChatLogs(1)[0]).toContain(falcon2.title);
                expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
                context.player1.clickPrompt('Done');

                expect(falcon1).toBeInZone('hand');
                expect(falcon2).toBeInZone('hand');
                expect(context.vanquish).toBeInZone('hand');
                expect(context.wampa).toBeInZone('hand');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
