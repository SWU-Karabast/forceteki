describe('Death Mark', function() {
    integration(function(contextRef) {
        describe('Death Mark\'s Bounty ability', function() {
            it('should draw 2 cards', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish']
                    },
                    player2: {
                        spaceArena: [{ card: 'restored-arc170', upgrades: ['death-mark'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.restoredArc170);

                // Currently failing because prompt is allowing user to choose if they want to draw cards,
                expect(context.player1.handSize).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
