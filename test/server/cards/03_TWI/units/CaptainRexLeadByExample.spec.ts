describe('Captain Rex Lead by Example', function() {
    integration(function(contextRef) {
        it('Captain Rex\'s ability should create 3 Clone Tropper tokens when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['captain-rex#lead-by-example'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.captainRex);

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers).toAllBeInZone('groundArena');
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
