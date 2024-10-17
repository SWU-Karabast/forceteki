describe('Cost adjusters', function() {
    integration(function(contextRef) {
        describe('Cost adjusters for playing cards', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: ['del-meeko#providing-overwatch'],
                        leader: 'director-krennic#aspiring-to-authority'
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: { card: 'kestro-city', damage: 5 },
                        resources: ['smugglers-aid', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('work when the card is smuggled', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.smugglersAid);
                expect(context.player2.countExhaustedResources()).toBe(4);
                expect(context.p2Base.damage).toBe(2);
                expect(context.smugglersAid).toBeInLocation('discard');
            });
        });
    });
});
