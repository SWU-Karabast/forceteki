describe('Now There are Two of Them', function() {
    integration(function(contextRef) {
        describe('Now There are Two of Them\'s ability -', function() {
            it('should allow you to play a non-Vehicle unit from your hand that shares a Trait with the unit you control for 5 less, if you have only one unit in play', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'now-there-are-two-of-them',
                            'syndicate-lackeys', // Selectable, only underworld Trait
                            'toro-calican#ambitious-upstart', // Selectable, only bounty hunter Trait
                            'cad-bane#hostage-taker', // The one selected and played
                            'plo-koon#kohtoyah', // Does not share a trait with Greedo
                            'fetts-firespray#pursuing-the-bounty', // Vehicle can't be selected
                            'chewbacca#pykesbane' // Too expensive to be played
                        ],
                        groundArena: ['greedo#slow-on-the-draw'],
                        base: { card: 'administrators-tower', damage: 0 },
                        leader: 'qira#i-alone-survived',
                        resources: 5
                    },
                    player2: {
                        hand: ['underworld-thug'], // Opponent's card can't be selected
                        groundArena: ['r2d2#full-of-solutions'], // Shares Republic trait with Plo-koon but should not m
                    }
                });

                const { context } = contextRef;

                // You can select Zuckuss and Cad Bane. Zuckuss is free to play.
                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1).toBeAbleToSelectExactly([context.toroCalican, context.cadBane, context.syndicateLackeys]);
                context.player1.clickCard(context.cadBane);
                expect(context.cadBane).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should not allow you to play a card if you have more than 1 unit in play or 0 unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'now-there-are-two-of-them',
                            'zuckuss#bounty-hunter-for-hire',
                            'plo-koon#kohtoyah',
                            'chewbacca#pykesbane'
                        ],
                        groundArena: ['greedo#slow-on-the-draw', 'cad-bane#hostage-taker'],
                        base: { card: 'administrators-tower', damage: 0 },
                        leader: 'qira#i-alone-survived',
                    }
                });

                const { context } = contextRef;

                // You can't play a card if you have more than one unit in play.
                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow you to play a card if you have 0 unit in play', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [
                            'now-there-are-two-of-them',
                            'zuckuss#bounty-hunter-for-hire',
                            'plo-koon#kohtoyah',
                            'chewbacca#pykesbane'
                        ],
                        groundArena: [],
                        base: { card: 'administrators-tower', damage: 0 },
                        leader: 'qira#i-alone-survived',
                    }
                });

                const { context } = contextRef;

                // You can't play a card if you have 0 unit in play.
                context.player1.clickCard(context.nowThereAreTwoOfThem);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
