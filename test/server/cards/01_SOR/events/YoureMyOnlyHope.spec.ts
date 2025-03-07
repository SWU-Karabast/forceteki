describe('You\'re My Only Hope', function() {
    integration(function(contextRef) {
        describe('You\'re My Only Hope\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        base: { card: 'administrators-tower', damage: 21 },
                        hand: ['youre-my-only-hope'],
                        deck: ['atst'],
                        groundArena: ['isb-agent']
                    },
                    player2: {
                        hand: ['regional-governor'],
                        spaceArena: ['black-one#scourge-of-starkiller-base']
                    }
                });
            });

            it('shows the top card of the deck and allows the player to leave it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.youreMyOnlyHope);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play for 5 less', 'Leave on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);

                context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'leave');

                expect(context.atst).toBeInZone('deck', context.player1);
            });

            it('shows the top card of the deck and allows the player to play it for 5 less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.youreMyOnlyHope);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play for 5 less', 'Leave on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);

                const exhaustedResourcesBeforeAction = context.player1.exhaustedResourceCount;
                context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'play-discount');

                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourcesBeforeAction + 3);
                expect(context.atst).toBeInZone('groundArena', context.player1);
            });

            it('shows the top card of the deck and allows the player to play it for free if their base has 5 or less remaining HP', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.blackOne);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.youreMyOnlyHope);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play for free', 'Leave on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);

                const exhaustedResourcesBeforeAction = context.player1.exhaustedResourceCount;
                context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'play-free');

                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourcesBeforeAction);
                expect(context.atst).toBeInZone('groundArena', context.player1);
            });

            it('shows the top card of the deck and disallows the player from playing it if it has been named by the Regional Governor', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.regionalGovernor);
                context.player2.chooseListOption('AT-ST');

                context.player1.clickCard(context.youreMyOnlyHope);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst]);
                expect(context.player1).toHaveExactDisabledDisplayPromptPerCardButtons(['Play for 5 less']);
                expect(context.player1).toHaveExactEnabledDisplayPromptPerCardButtons(['Leave on top']);
                expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);

                context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'leave');
                expect(context.atst).toBeInZone('deck', context.player1);
            });

            it('does nothing if the deck is empty', function () {
                const { context } = contextRef;
                context.player1.moveCard(context.atst, 'discard');

                expect(context.player1.deck.length).toEqual(0);
                context.player1.clickCard(context.youreMyOnlyHope);
                expect(context.youreMyOnlyHope).toBeInZone('discard', context.player1);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
