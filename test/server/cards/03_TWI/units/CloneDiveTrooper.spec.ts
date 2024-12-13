describe('Clone Dive Trooper', function() {
    integration(function(contextRef) {
        it('Clone Dive Trooper\'s constant Coordinate ability should give -2/0 to target when attacking a unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['clone-dive-trooper', 'battlefield-marine', 'compassionate-senator'],
                },
                player2: {
                    groundArena: ['pyke-sentinel', 'greedo#slow-on-the-draw']
                }
            });

            const { context } = contextRef;

            // Coordinate online
            context.player1.clickCard(context.cloneDiveTrooper);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.cloneDiveTrooper).toBeInZone('groundArena');
            expect(context.cloneDiveTrooper.damage).toBe(0);
            expect(context.pykeSentinel.damage).toBe(2);
            context.player2.passAction();

            context.player1.moveCard('battlefield-marine', 'discard');
            context.cloneDiveTrooper.exhausted = false;

            // coordinate offline
            context.player1.clickCard(context.cloneDiveTrooper);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.cloneDiveTrooper).toBeInZone('discard');
        });
    });
});
