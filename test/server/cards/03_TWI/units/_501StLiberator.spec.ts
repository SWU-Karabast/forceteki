describe('501st-liberator', function() {
    integration(function(contextRef) {
        it('501st-liberator\'s when played ability should restore 3 from base, if a friendly republic unit is in play', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['mace-windu#party-crasher'],
                    hand: ['501st-liberator'],
                    base: { card: 'echo-base', damage: 12 }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            expect(context.p1Base.damage).toBe(12);
            context.player1.clickCard(context._501stLiberator);
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(9);
        });
    });
});