describe('Now There are Two of Them', function() {
    integration(function(contextRef) {
        describe('Now There are Two of Them\'s ability -', function() {
            it('should allow you to play a non-Vehicle unit from your hand that shares a Trait with the unit you control for 5 less, if you have only one unit in play', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['now-there-are-two-of-them', 'zuckuss#bounty-hunter-for-hire', 'cad-bane#hostage-taker', 'plo-koon#kohtoyah', 'fetts-firespray#pursuing-the-bounty'],
                        groundArena: ['greedo#slow-on-the-draw'],
                        base: { card: 'administrators-tower', damage: 0 },
                        leader: 'qira#i-alone-survived',
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // You can select Zuckuss and Cad Bane. Zuckuss is free to play.
                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1).toBeAbleToSelectExactly([context.zuckuss, context.cadBane]);
                context.player1.clickCard(context.zuckuss);
                expect(context.zuckuss).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);

                // You can't select Cad Bane if do not have enough resources.
                // Reset setup
                context.player2.passAction();
                context.player1.setHand([context.nowThereAreTwoOfThem, context.zuckuss, context.cadBane, context.ploKoon, context.fettsFirespray]);
                context.player1.setResourceCount(3);
                context.player1.readyResources();

                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1).toBeAbleToSelectExactly([context.zuckuss]);
                context.player1.clickCard(context.zuckuss);
                expect(context.zuckuss).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should not allow you to play a card if you have more than 1 unit in play or 0 unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['now-there-are-two-of-them', 'zuckuss#bounty-hunter-for-hire', 'plo-koon#kohtoyah'],
                        groundArena: ['greedo#slow-on-the-draw', 'cad-bane#hostage-taker'],
                        base: { card: 'administrators-tower', damage: 0 },
                        leader: 'qira#i-alone-survived',
                    }
                });

                const { context } = contextRef;

                // You can't play a card if you have more than one unit in play.
                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player2).toBeActivePlayer();

                // You can't play a card if you have 0 unit in play.
                // Reset setup
                context.player2.passAction();
                context.player1.setHand([context.nowThereAreTwoOfThem, context.zuckuss, context.ploKoon]);
                context.player1.setGroundArenaUnits([]);

                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
