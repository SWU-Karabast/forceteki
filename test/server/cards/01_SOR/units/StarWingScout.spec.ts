describe('Star Wing Scout', function () {
    integration(function (contextRef) {
        describe('Star Wing Scout\'s ability', function () {
            describe('when the player has initiative', function () {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            spaceArena: ['star-wing-scout'],
                            hasInitiative: true
                        },
                        player2: {
                            hand: ['rivals-fall']
                        }
                    });
                });

                it('should draw 2 cards', function () {
                    const { context } = contextRef;

                    // Player 1 passing action so we start with player 2
                    context.player1.passAction();
                    expect(context.player2).toBeActivePlayer();

                    // Player 2 plays Rival's Fall, targeting Star Wing Scout
                    context.player2.clickCard(context.rivalsFall);
                    expect(context.starWingScout.location).toBe('discard');

                    // Player 1 draws 2 cards
                    expect(context.player1.handSize).toBe(2);
                });
            });

            describe('when the player has initiative', function () {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            spaceArena: ['star-wing-scout']
                        },
                        player2: {
                            hand: ['rivals-fall'],
                            hasInitiative: true
                        }
                    });
                });

                it('should not draw 2 cards', function () {
                    const { context } = contextRef;

                    // Player 1 passing action so we start with player 2
                    expect(context.player2).toBeActivePlayer();

                    // Player 2 plays Rival's Fall, targeting Star Wing Scout
                    context.player2.clickCard(context.rivalsFall);
                    expect(context.starWingScout.location).toBe('discard');

                    // Player 1 draws 2 cards
                    expect(context.player1.handSize).toBe(0);
                });
            });
        });
    });
});
