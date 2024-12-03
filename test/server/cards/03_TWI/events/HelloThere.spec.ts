describe('Hello There', function() {
    integration(function(contextRef) {
        describe('Hello There\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['hello-there', 'green-squadron-awing', 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['atst', 'consular-security-force'],
                    }
                });
            });

            it('should apply -4/-4 to a unit which entered play this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pykeSentinel);
                context.player2.clickCard(context.consularSecurityForce);

                context.moveToNextActionPhase();

                // play a-wing & opponent plays atst
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.atst);

                // play hello there, should be able to select a-wing & at-st
                context.player1.clickCard(context.helloThere);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.atst]);

                // at-st should be 2/3
                context.player1.clickCard(context.atst);
                expect(context.atst.getPower()).toBe(2);
                expect(context.atst.getHp()).toBe(3);

                // on next phase -4/-4 should be gone
                context.moveToNextActionPhase();
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });
        });
    });
});
