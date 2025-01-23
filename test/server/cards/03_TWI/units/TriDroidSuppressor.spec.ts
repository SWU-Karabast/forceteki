describe('Tri-Droid Suppressor', function() {
    integration(function(contextRef) {
        describe('Tri-Droid Suppressor\'s ability', function() {
            it('should exhaust an enemy groud unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['tridroid-suppressor'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['lom-pyke#dealer-in-truths', { card: 'pyke-sentinel', exhausted: true }],
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tridroidSuppressor);
                context.player1.clickPrompt('Play Tri-Droid Suppressor');
                expect(context.player1).toBeAbleToSelectExactly([context.lomPyke, context.pykeSentinel]);

                context.player1.clickCard(context.lomPyke);
                expect(context.lomPyke.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});