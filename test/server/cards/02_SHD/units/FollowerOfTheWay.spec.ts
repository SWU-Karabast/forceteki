describe('Follower of the Way', function() {
    integration(function(contextRef) {
        describe('Follower of the Way\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['covert-strength'],
                        groundArena: [{ card: 'follower-of-the-way', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: ['steadfast-battalion']
                    }
                });
            });

            it('should give +1/+1 to itself when upgraded', function () {
                const { context } = contextRef;

                // validate buff with upgrade
                expect(context.followerOfTheWay.getPower()).toBe(2);
                expect(context.followerOfTheWay.getHp()).toBe(4);

                // validate buff removed without upgrade
                context.player1.clickCard(context.followerOfTheWay);
                context.player1.clickCard(context.steadfastBattalion);
                expect(context.followerOfTheWay.getPower()).toBe(1);
                expect(context.followerOfTheWay.getHp()).toBe(3);

                // validate correct buff with experience
                context.player2.passAction();
                context.player1.clickCard(context.covertStrength);
                context.player1.clickCard(context.followerOfTheWay);
                expect(context.followerOfTheWay.getPower()).toBe(3);
                expect(context.followerOfTheWay.getHp()).toBe(5);
            });
        });
    });
});