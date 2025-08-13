describe('C-3PO, Anything I Might Do', function() {
    integration(function(contextRef) {
        it('C-3PO\'s ability should give a unit +2/+2 for the phase and return to hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['c3po#anything-i-might-do', 'battlefield-marine'],
                    hand: []
                },
                player2: {
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            // Use C-3PO's ability
            context.player1.clickCard(context.c3po);
            context.player1.clickPrompt('Give a unit +2/+2 for this phase');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Verify the unit got +2/+2
            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(5);

            // Verify C-3PO returned to hand
            expect(context.c3po).toBeInZone('hand');

            // End the phase and verify the buff is gone
            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });

        it('C-3PO\'s ability should not be available if C3P0 is exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'c3po#anything-i-might-do', exhausted: true }, 'battlefield-marine'],
                    hand: []
                },
                player2: {
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            expect(context.c3po).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});