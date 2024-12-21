describe('Clone Dive Trooper', function() {
    integration(function(contextRef) {
        it('Clone Dive Trooper\'s constant Coordinate ability should give -2/0 to target when attacking a unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['clone-dive-trooper', 'battlefield-marine', 'compassionate-senator'],
                },
                player2: {
                    groundArena: ['admiral-yularen#advising-caution', 'rey#keeping-the-past'],
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Coordinate online
            context.player1.clickCard(context.cloneDiveTrooper);
            context.player1.clickCard(context.admiralYularen);
            expect(context.cloneDiveTrooper).toBeInZone('groundArena');
            expect(context.cloneDiveTrooper.damage).toBe(0);
            expect(context.admiralYularen.damage).toBe(2);
            context.player2.passAction();

            // testing that other units dont benefit from the +2 on attack
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.rey);
            expect(context.rey.damage).toBe(3);
            context.moveToNextActionPhase();

            // coordinate offline
            context.player1.clickCard(context.cloneDiveTrooper);
            context.player1.clickCard(context.admiralYularen);
            expect(context.cloneDiveTrooper).toBeInZone('discard');
        });
    });
});
