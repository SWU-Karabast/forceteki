describe('Discerning Veteran', function() {
    integration(function(contextRef) {
        describe('Discerning Veteran\'s when played ability', function() {
            it('should capture an enemy ground unit', () => {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['discerning-veteran'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.discerningVeteran);

                expect(context.wampa.zoneName).toBe('capture');
            });
        });
    });
});
