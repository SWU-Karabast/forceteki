describe('Aayla Secura, Master of the Blade', function() {
    integration(function(contextRef) {
        describe('Aayla Secura\'s on attack Coordinate ability', function() {
            it('should prevent combat damage to Aayla when Coordinate condition is met', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'aayla-secura#master-of-the-blade',
                            'battlefield-marine',
                            'clone-trooper'
                        ],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.aaylaSecura.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(6);
            });

            it('should not prevent combat damage to Aayla when Coordinate condition is not met', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['aayla-secura#master-of-the-blade', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.aaylaSecura.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(6);
            });

            it('should not prevent combat damage to Aayla when Coordinate condition is met but Aayla is not attacking', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'aayla-secura#master-of-the-blade',
                            'battlefield-marine',
                            'clone-trooper'
                        ],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.aaylaSecura);

                expect(context.aaylaSecura.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(6);
            });
        });
    });
});
