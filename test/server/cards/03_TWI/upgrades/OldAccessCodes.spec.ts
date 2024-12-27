describe('Old Access Codes', function() {
    integration(function(contextRef) {
        describe('Old Access Codes ability', function() {
            it('should draw a card when the controller has fewer units than the opponent', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['old-access-codes'],
                        groundArena: ['battlefield-marine'],
                        deck: ['ahsoka-tano#always-ready-for-trouble']
                    },
                    player2: {
                        groundArena: ['r2d2#ignoring-protocol', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.oldAccessCodes);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.handSize).toBe(1);
                expect(context.ahsokaTano).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not draw a card as the controller has more units than the opponent', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['old-access-codes'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: [{ card: 'r2d2#ignoring-protocol', upgrades: ['academy-training'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.oldAccessCodes);
                context.player1.clickCard(context.battlefieldMarine);

                // Opponent controls same amount of units than player, not able to draw a card
                expect(context.player1.handSize).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
