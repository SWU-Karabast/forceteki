describe('Tantive IV Fleeing The Empire', function() {
    integration(function(contextRef) {
        it('Tantive IV Fleeing The Empire\'s ability should create an XWing when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['tantive-iv#fleeing-the-empire']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.tantiveIv);
            const xwings = context.player1.findCardsByName('xwing');
            expect(xwings.length).toBe(1);
            expect(xwings).toAllBeInZone('spaceArena');
            expect(xwings.every((tie) => tie.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
