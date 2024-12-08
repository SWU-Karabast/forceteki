describe('Plo Koon Kohtoyah', function () {
    integration(function (contextRef) {
        describe('Plo Koon Kohtoyah\'s ability', function () {
            it('should ambush attack for 6 and defend for 3', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['plo-koon#kohtoyah'],
                        groundArena: ['specforce-soldier', 'luke-skywalker#jedi-knight'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ploKoon);
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.ploKoon.damage).toBe(3);
                expect(context.ploKoon.exhausted).toBeTrue();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.ploKoon);
                expect(context.wampa.damage).toBe(3);
            });

            it('should not active coordinate', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['plo-koon#kohtoyah'],
                        groundArena: ['specforce-soldier'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ploKoon);
                context.player1.clickPrompt('Ambush');
                expect(context.wampa.damage).toBe(3);
                expect(context.ploKoon.damage).toBe(4);
            });
        });
    });
});
