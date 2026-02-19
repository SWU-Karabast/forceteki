describe('Assault Lander LAAT', function() {
    integration(function(contextRef) {
        describe('Assault Lander LAAT\'s abilities', function() {
            it('should create 2 Clone Trooper tokens when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['assault-lander-laat'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.assaultLanderLaat);
                const troopers = context.player1.findCardsByName('clone-trooper');
                expect(troopers.length).toBe(2);

                for (const trooper of troopers) {
                    expect(trooper.exhausted).toBeTrue();
                }
            });

            it('should deal 4 damage to itself at start of Regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['assault-lander-laat'],
                    },
                });

                const { context } = contextRef;

                context.moveToRegroupPhase();
                expect(context.assaultLanderLaat.damage).toBe(4);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });
        });
    });
});
