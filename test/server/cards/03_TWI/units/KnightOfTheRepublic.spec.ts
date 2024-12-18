describe('Knight of the Republic', function() {
    integration(function(contextRef) {
        describe('Knight of the Republic\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['droid-commando']

                    },
                    player2: {
                        groundArena: ['knight-of-the-republic']
                    }
                });
            });

            it('should create a Clone Trooper token when attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.droidCommando);
                context.player1.clickCard(context.knightOfTheRepublic);

                const cloneTroopers = context.player2.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(1);
                expect(cloneTroopers).toAllBeInZone('groundArena');
                expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
            });
        });
    });
});
