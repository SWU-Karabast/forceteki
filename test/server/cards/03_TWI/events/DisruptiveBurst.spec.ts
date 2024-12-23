describe('Disruptive Burst', function() {
    integration(function(contextRef) {
        describe('Disruptive Burst\'s ability', function() {
            it('should apply -1/-1 to all enemy units for this phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['disruptive-burst'],
                        groundArena: ['fifth-brother#fear-hunter']
                    },
                    player2: {
                        hand: ['droid-deployment'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.droidDeployment);
                const battleDroids = context.player2.findCardsByName('battle-droid');

                // Test setup with two Battle Droid tokens
                expect(battleDroids.length).toBe(2);

                // Apply the effect to the enemy units
                context.player1.clickCard(context.disruptiveBurst);
                expect(context.consularSecurityForce.getPower()).toBe(2);
                expect(context.consularSecurityForce.getHp()).toBe(6);
                expect(context.tielnFighter).toBeInZone('discard');

                // Do not apply the effect to the player's units
                expect(context.fifthBrother.getPower()).toBe(2);
                expect(context.fifthBrother.getHp()).toBe(4);

                // Defeat the Battle Droids
                expect(context.player2.findCardsByName('battle-droid').length).toBe(0);

                // Move to the next phase and buff should be removed
                context.moveToNextActionPhase();
                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);
            });
        });
    });
});
