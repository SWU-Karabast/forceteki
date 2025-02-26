describe('Knight of the Republic', function() {
    integration(function(contextRef) {
        describe('Knight of the Republic\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['droid-commando', 'warrior-drone']

                    },
                    player2: {
                        groundArena: ['knight-of-the-republic', 'royal-guard-attache']
                    }
                });
            });

            it('should create a Clone Trooper token when attacked', function () {
                const { context } = contextRef;

                // Should create a Clone Tropper token when Knight of the Republic is attacked
                context.player1.clickCard(context.droidCommando);
                context.player1.clickCard(context.knightOfTheRepublic);

                let cloneTroopers = context.player2.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(1);
                expect(cloneTroopers).toAllBeInZone('groundArena', context.player2);
                expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();

                context.moveToNextActionPhase();

                // Should not create a Clone Trooper token when any another unit is attacked
                context.player1.clickCard(context.warriorDrone);
                context.player1.clickCard(context.royalGuardAttache);

                cloneTroopers = context.player2.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(1);
            });
        });
    });
});
