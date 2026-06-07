describe('Durasteel Plating', function() {
    integration(function(contextRef) {
        it('should give a Shield token to the attached unit when played and grant +1/+1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['durasteel-plating'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['pyke-sentinel']
                }
            });

            const { context } = contextRef;

            // Durasteel Plating has no attach restriction, so it can target any unit
            context.player1.clickCard(context.durasteelPlating);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.pykeSentinel]);
            context.player1.clickCard(context.battlefieldMarine);

            // attached unit gets a Shield token plus the upgrade, and +1/+1
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield', 'durasteel-plating']);
            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(4);
        });
    });
});
