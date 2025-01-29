describe('Geonosis Patrol Fighter', function() {
    integration(function(contextRef) {
        it('Geonosis Patrol Fighter\'s when played ability should return a non-leader unit that costs 3 or less to its owner\'s hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['geonosis-patrol-fighter'],
                    groundArena: ['r2d2#ignoring-protocol']
                },
                player2: {
                    groundArena: ['clone-heavy-gunner'],
                    spaceArena: ['restored-arc170'],
                    hand: ['waylay']
                }
            });

            const { context } = contextRef;

            // Returns Ground unit that costs 3 or less
            context.player1.clickCard(context.geonosisPatrolFighter);
            context.player1.clickPrompt('Play Geonosis Patrol Fighter');

            expect(context.player1).toBeAbleToSelectExactly([context.cloneHeavyGunner, context.restoredArc170, context.r2d2]);
            context.player1.clickCard(context.cloneHeavyGunner);
            expect(context.cloneHeavyGunner).toBeInZone('hand');

            // Returns own unit
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.geonosisPatrolFighter);
            context.player1.clickCard(context.geonosisPatrolFighter);
            context.player1.clickPrompt('Play Geonosis Patrol Fighter');
            expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170, context.r2d2]);

            context.player1.clickCard(context.r2d2);
            expect(context.r2d2).toBeInZone('hand');
        });
    });
});
