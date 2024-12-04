describe('Anakin Skywalker, Maverick Mentor', function() {
    integration(function(contextRef) {
        it('Anakin\'s on attack Coordinate ability should draw a card', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#maverick-mentor', 'battlefield-marine'],
                    spaceArena: ['wing-leader'],
                    deck: ['wampa', 'atst']
                },
                player2: {
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Coordinate online
            context.player1.clickCard(context.anakinSkywalker);

            expect(context.p2Base.damage).toBe(6);
            expect(context.player1.handSize).toBe(1);
            expect(context.wampa).toBeInZone('hand');

            // Coordinate offline
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.battlefieldMarine);

            context.anakinSkywalker.exhausted = false;
            context.player1.clickCard(context.anakinSkywalker);

            expect(context.p2Base.damage).toBe(12);
            expect(context.player1.handSize).toBe(1);
        });
    });
});
