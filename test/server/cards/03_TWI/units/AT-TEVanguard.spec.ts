describe('AT-TE Vanguard', function() {
    integration(function(contextRef) {
        describe('AT-TE Vanguard\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side']

                    },
                    player2: {
                        groundArena: ['atte-vanguard']
                    }
                });
            });

            it('should create 2 Clone Tropper tokens when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                context.player2.clickCard(context.atteVanguard);

                const cloneTroopers = context.player2.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(2);
                expect(cloneTroopers).toAllBeInZone('groundArena');
                expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
            });
        });

        it('should create the Clone Trooper tokens for the opponent when defeated with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atte-vanguard']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.atteVanguard);

            expect(context.atteVanguard).toBeInZone('discard', context.player1);
            expect(context.player1.findCardsByName('clone-trooper').length).toBe(0);

            const cloneTroopers = context.player2.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers).toAllBeInZone('groundArena', context.player2);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
            expect(context.player1).toBeActivePlayer();
        });
    });
});
