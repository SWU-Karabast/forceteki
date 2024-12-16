describe('AT-TE Vanguard', function() {
    integration(function(contextRef) {
        describe('AT-TE Vanguard\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
    });
});
