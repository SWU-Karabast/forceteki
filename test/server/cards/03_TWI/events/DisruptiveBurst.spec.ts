describe('Disruptive Burst', function() {
    integration(function(contextRef) {
        it('Disruptive Burst\'s ability should apply -1/-1 to all enemy units for this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['disruptive-burst'],
                    groundArena: ['fifth-brother#fear-hunter']
                },
                player2: {
                    groundArena: ['consular-security-force', 'battle-droid', 'battle-droid'],
                    spaceArena: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            // Apply the effect to the enemy units
            context.player1.clickCard(context.disruptiveBurst);
            expect(context.consularSecurityForce.getPower()).toBe(2);
            expect(context.consularSecurityForce.getHp()).toBe(6);
            expect(context.tielnFighter).toBeInZone('discard');

            // Do not apply the effect to the player's units
            expect(context.fifthBrother.getPower()).toBe(2);
            expect(context.fifthBrother.getHp()).toBe(4);

            // Defeat the Battle Droids
            const battleDroids = context.player2.findCardsByName('battle-droid');
            expect(battleDroids[0]).toBeInZone('outsideTheGame');
            expect(battleDroids[1]).toBeInZone('outsideTheGame');

            // Move to the next phase and buff should be removed
            context.moveToNextActionPhase();
            expect(context.consularSecurityForce.getPower()).toBe(3);
            expect(context.consularSecurityForce.getHp()).toBe(7);
        });
    });
});
