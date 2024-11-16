describe('Force Choke', function() {
    integration(function(contextRef) {
        describe('Force Choke\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['force-choke'],
                        groundArena: ['pyke-sentinel', 'krayt-dragon'],
                        leader: 'darth-vader#dark-lord-of-the-sith'
                    },
                    player2: {
                        groundArena: ['atst', 'consular-security-force'],
                    }
                });
            });

            it('deal 5 damage to a unit and cause the controller to draw a card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.forceChoke);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.kraytDragon, context.consularSecurityForce]);

                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon.damage).toBe(5);
                expect(context.player1.countExhaustedResources()).toBe(2);
                expect(context.player1.handSize).toBe(1);
            });

            it('should cost 1 less if the player controls a Force unit', function () {
                const { context } = contextRef;

                context.player1.setLeaderStatus({ card: 'darth-vader#dark-lord-of-the-sith', deployed: true });
                expect(context.darthVader).toBeInZone('ground arena');

                context.player1.clickCard(context.forceChoke);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.kraytDragon, context.darthVader, context.consularSecurityForce]);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.player1.countExhaustedResources()).toBe(1);
                expect(context.player2.handSize).toBe(1);
            });
        });
    });
});
