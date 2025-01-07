describe('Corner The Prey', function() {
    integration(function(contextRef) {
        describe('Corner The Prey\'s ability -', function() {
            it('should attack with a unit getting +1 power for each damage on the defender before the attack', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['corner-the-prey'],
                        groundArena: ['consular-security-force'],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 1 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cornerThePrey);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.damage).toBe(6);
            });
        });
    });
});
