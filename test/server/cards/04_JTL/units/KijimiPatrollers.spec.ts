describe('KijimiPatrollers', function () {
    integration(function (contextRef) {
        it('KijimiPatrollers\'s ability should create a tie fighter token', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['kijimi-patrollers'],
                }
            });

            const { context } = contextRef;

            // Play Kijimi Patrollers
            context.player1.clickCard(context.kijimiPatrollers);

            // Assert the ability
            expect(context.player2).toBeActivePlayer();

            const tieFighters = context.player1.findCardsByName('tie-fighter');
            expect(tieFighters.length).toBe(1);
            expect(tieFighters).toAllBeInZone('spaceArena');
            expect(tieFighters.every((tie) => tie.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
