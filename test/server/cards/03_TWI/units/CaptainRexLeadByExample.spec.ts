describe('Captain Rex Lead by Example', function() {
    integration(function(contextRef) {
        it('Captain Rex\'s ability should should create 3 Clone Tropper tokens when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['captain-rex#lead-by-example'],

                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.captainRex);

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers).toAllBeInZone('groundArena');
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();

            // No Clone Trooper for player 2
            const player2ArenaCard = context.player2.getArenaCards();
            expect(player2ArenaCard.length).toBe(1); // only Battlefield Marine
        });
    });
});
