describe('Del Meeko, Providing Overwatch', function() {
    integration(function(contextRef) {
        describe('Del Meeko\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: ['del-meeko#providing-overwatch'],
                        leader: 'luke-skywalker#faithful-friend'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['daring-raid', 'repair'],
                        leader: 'director-krennic#aspiring-to-authority',
                        base: 'kestro-city'
                    }
                });
            });

            it('should increase the cost of events played by the opponent by 1', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });
        });
    });
});
