describe('Pounce', function() {
    integration(function(contextRef) {
        it('Pounce\'s ability should attack with a creature unit with +4/+0', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pounce'],
                    groundArena: ['hunting-nexu', 'alliance-dispatcher']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.pounce);

            // can only attack with a creature unit
            expect(context.player1).toBeAbleToSelectExactly([context.huntingNexu]);

            context.player1.clickCard(context.huntingNexu);
            context.player1.clickCard(context.p2Base);

            // should have +4
            expect(context.p2Base.damage).toBe(8);
            expect(context.player2).toBeActivePlayer();
            expect(context.huntingNexu.getPower()).toBe(4);
        });
    });
});