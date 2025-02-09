describe('Admiral Piett Commanding The Armada', function () {
    integration(function (contextRef) {
        describe('Admiral Piett\'s undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-piett#commanding-the-armada',
                        hand: ['first-order-tie-fighter', 'arquitens-assault-cruiser', 'gideons-light-cruiser#dark-troopers-station', 'outlaw-corona'],
                        resources: 2
                    },
                });
            });

            it('should allow the player to play a Capital Ship unit from hand, it costs 1 resource less', function () {
                const { context } = contextRef;

                // Select a capital ship 3 cost and play for 2
                context.player1.clickCard(context.admiralPiett);
                expect(context.player1).toBeAbleToSelectExactly([context.outlawCorona]); // Fighter not selectable as not a Capital ship
                context.player1.clickCard(context.outlawCorona);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.outlawCorona).toBeInZone('spaceArena');
            });
        });

        describe('Admiral Piett\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'admiral-piett#commanding-the-armada', deployed: true },
                        hand: ['reinforcement-walker', 'arquitens-assault-cruiser', 'finalizer#might-of-the-first-order', 'outlaw-corona'],
                        resources: 10
                    },
                    player2: {
                        base: 'echo-base',
                        hand: ['pelta-supply-frigate'],
                        resources: 5
                    },
                });
            });

            it('should allow the player to play a Capital Ship unit from hand, it costs 2 resource less', function () {
                const { context } = contextRef;

                // Play a Capital ship for 2 resources less
                context.player1.clickCard(context.finalizer);
                expect(context.player1.exhaustedResourceCount).toBe(9);

                // check Opponnent doesnt gain benefit
                context.player2.clickCard(context.peltaSupplyFrigate);
                expect(context.player2.exhaustedResourceCount).toBe(5);

                // Exhaust Piett
                context.player1.clickCard(context.admiralPiett);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // Piett exhausted, still can use action
                context.player1.clickCard(context.outlawCorona);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });
        });
    });
});
