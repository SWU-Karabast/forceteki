describe('No One Ever Knew', function() {
    integration(function(contextRef) {
        it('For each friendly Official unit, exhaust an enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-one-ever-knew'],
                    groundArena: ['rune-haako#scheming-second', 'wartime-trade-official']
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine', 'pyke-sentinel']
                }
            });

            const { context } = contextRef;

            // Play the event; we should be able to select exactly 2 enemy units to exhaust
            context.player1.clickCard(context.noOneEverKnew);
            // These enemy units should be selectable; there may be others (e.g., an enemy leader)
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.pykeSentinel]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            // Verify selected enemy units are exhausted and the other is not
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.pykeSentinel.exhausted).toBeFalse();

            // Priority passes
            expect(context.player2).toBeActivePlayer();
        });
    });
});
