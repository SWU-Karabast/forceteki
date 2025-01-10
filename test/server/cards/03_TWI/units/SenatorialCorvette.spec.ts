describe('Senatorial Corvette', function() {
    integration(function(contextRef) {
        describe('Senatorial Corvette\'s When Defeated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['senatorial-corvette'],
                    },
                    player2: {
                        hand: ['wampa'],
                        spaceArena: ['ruthless-raider'],
                    },
                    autoSingleTarget: true
                });
            });

            it('should discard a card from opponents hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.senatorialCorvette);
                context.player1.clickCard(context.ruthlessRaider);

                expect(context.player2.handSize).toBe(0);
                expect(context.wampa).toBeInZone('discard');
            });
        });
    });
});
