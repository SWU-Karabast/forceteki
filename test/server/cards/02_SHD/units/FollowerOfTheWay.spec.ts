describe('Follower of the Way', function() {
    integration(function(contextRef) {
        describe('Follower of the Way\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'follower-of-the-way', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: ['steadfast-battalion']
                    }
                });
            });

            it('should give +1/+1 to itself when upgraded', function () {
                const { context } = contextRef;
                expect(context.followerOfTheWay.getPower()).toBe(2);
                expect(context.followerOfTheWay.getHp()).toBe(4);
            });
        });

        describe('Follower of the Way\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'follower-of-the-way', upgrades: ['experience'] }]
                    },
                    player2: {
                        groundArena: ['steadfast-battalion']
                    }
                });
            });

            it('should give +1/+1 to itself when upgraded', function () {
                const { context } = contextRef;
                expect(context.followerOfTheWay.getPower()).toBe(3);
                expect(context.followerOfTheWay.getHp()).toBe(5);
            });
        });

        describe('Follower of the Way\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['follower-of-the-way']
                    },
                    player2: {
                        groundArena: ['steadfast-battalion']
                    }
                });
            });

            it('should not give +1/+1 to itself when not upgraded', function () {
                const { context } = contextRef;

                expect(context.followerOfTheWay.getPower()).toBe(1);
                expect(context.followerOfTheWay.getHp()).toBe(3);
            });
        });
    });
});
