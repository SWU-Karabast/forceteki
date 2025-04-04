describe('Star Wing Scout', function () {
    integration(function (contextRef) {
        describe('Star Wing Scout\'s ability', function () {
            describe('when the player has initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['star-wing-scout'],
                            hasInitiative: true
                        },
                        player2: {
                            hand: ['rivals-fall']
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });
                });

                it('should draw 2 cards', function () {
                    const { context } = contextRef;

                    // Player 1 passing action so we start with player 2
                    context.player1.passAction();
                    expect(context.player2).toBeActivePlayer();

                    // Player 2 plays Rival's Fall, targeting Star Wing Scout
                    context.player2.clickCard(context.rivalsFall);
                    expect(context.starWingScout.zoneName).toBe('discard');

                    // Player 1 draws 2 cards
                    expect(context.player1.handSize).toBe(2);
                });
            });

            describe('when the player does not have initiative', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            spaceArena: ['star-wing-scout']
                        },
                        player2: {
                            hand: ['rivals-fall'],
                            hasInitiative: true
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });
                });

                it('should not draw 2 cards', function () {
                    const { context } = contextRef;

                    // Player 1 passing action so we start with player 2
                    expect(context.player2).toBeActivePlayer();

                    // Player 2 plays Rival's Fall, targeting Star Wing Scout
                    context.player2.clickCard(context.rivalsFall);
                    expect(context.starWingScout.zoneName).toBe('discard');

                    // Player 1 draws 2 cards
                    expect(context.player1.handSize).toBe(0);
                });
            });

            it('should work with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['star-wing-scout']
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        deck: ['battlefield-marine', 'vanguard-infantry'],
                        hasInitiative: true
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.starWingScout);
                expect(context.player2.handSize).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
                expect(context.vanguardInfantry).toBeInZone('hand', context.player2);

                context.player1.passAction();
            });
        });
    });
});
