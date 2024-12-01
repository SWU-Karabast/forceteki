describe('Anakin Skywalker, Maverick Mentor', function() {
    integration(function(contextRef) {
        it('Anakin\'s on attack Coordinate ability should draw a card', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#maverick-mentor', 'battlefield-marine'],
                    spaceArena: ['wing-leader'],
                    deck: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);

            expect(context.p2Base.damage).toBe(6);
            expect(context.player1.handSize).toBe(1);
            expect(context.wampa).toBeInZone('hand');
        });

        // TODO THIS PR: merge these tests
        it('Anakin\'s on attack Coordinate ability should do nothing if fewer than 3 units', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#maverick-mentor'],
                    spaceArena: ['wing-leader'],
                    deck: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);

            expect(context.p2Base.damage).toBe(6);
            expect(context.player1.handSize).toBe(0);
        });
    });
});
