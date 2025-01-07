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
                        groundArena: [{ card: 'chewbacca#pykesbane', damage: 2 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cornerThePrey);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.chewbacca);
                expect(context.chewbacca.damage).toBe(7);
                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(6);
            });

            it('should attack with a unit getting +0/+0 while attacking a base', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['corner-the-prey'],
                        groundArena: ['consular-security-force'],
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#pykesbane', damage: 2 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cornerThePrey);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.p2Base);
                expect(context.player2.base.damage).toBe(3);
                expect(context.consularSecurityForce.getPower()).toBe(3);
            });
        });
    });
});
