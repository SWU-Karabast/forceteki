describe('Senatorial Corvette', function() {
    integration(function(contextRef) {
        it('should discard a card from opponents hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    spaceArena: ['senatorial-corvette'],
                },
                player2: {
                    hand: ['atst'],
                    spaceArena: ['ruthless-raider'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.senatorialCorvette);
            context.player1.clickCard(context.ruthlessRaider);
            context.player2.clickCard(context.atst);

            expect(context.player2.handSize).toBe(0);
            expect(context.atst).toBeInZone('discard');
            expect(context.player1.handSize).toBe(1);
            expect(context.wampa).toBeInZone('hand');
        });
    });
});
