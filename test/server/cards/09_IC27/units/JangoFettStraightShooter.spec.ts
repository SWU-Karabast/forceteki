describe('Jango Fett, Straight Shooter', function() {
    integration(function(contextRef) {
        describe('Jango Fett\'s When Defeated ability', function() {
            it('should allow discarding a card from hand to return a chosen event from your discard pile', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'disarm'],
                        groundArena: ['jango-fett#straight-shooter'],
                        discard: [
                            'vanquish',
                            'surprise-strike',
                            'atst'
                        ]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        discard: ['tactical-advantage']
                    }
                });

                const { context } = contextRef;

                // Jango attacks Wampa and is defeated
                context.player1.clickCard(context.jangoFettStraightShooter);
                context.player1.clickCard(context.wampa);

                // Discard is optional and any card in hand can be chosen
                expect(context.jangoFettStraightShooter).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.disarm]);

                // Discard Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Only events from own discard pile can be returned, and the return is mandatory
                expect(context.player1).toBeAbleToSelectExactly([context.vanquish, context.surpriseStrike]);
                expect(context.player1).not.toHavePassAbilityButton();

                // Return Surprise Strike to hand
                context.player1.clickCard(context.surpriseStrike);
                expect(context.surpriseStrike).toBeInZone('hand');
                expect(context.vanquish).toBeInZone('discard');
                expect(context.tacticalAdvantage).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to return the event that was just discarded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['jango-fett#straight-shooter']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Jango attacks Wampa and is defeated
                context.player1.clickCard(context.jangoFettStraightShooter);
                context.player1.clickCard(context.wampa);

                // Discard Disarm, making it the only event in the discard pile
                context.player1.clickCard(context.disarm);
                expect(context.player1).toBeAbleToSelectExactly([context.disarm]);

                // Return Disarm to hand
                context.player1.clickCard(context.disarm);
                expect(context.disarm).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline discarding a card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['jango-fett#straight-shooter'],
                        discard: ['vanquish']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Jango attacks Wampa and is defeated
                context.player1.clickCard(context.jangoFettStraightShooter);
                context.player1.clickCard(context.wampa);

                // Decline to discard, nothing changes
                context.player1.clickPrompt('Pass');
                expect(context.disarm).toBeInZone('hand');
                expect(context.vanquish).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if your hand is empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jango-fett#straight-shooter'],
                        discard: ['vanquish']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Jango attacks Wampa and is defeated, there is no card to discard
                context.player1.clickCard(context.jangoFettStraightShooter);
                context.player1.clickCard(context.wampa);

                // Event stays in discard pile
                expect(context.vanquish).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should still allow discarding when there is no event in your discard pile', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['jango-fett#straight-shooter'],
                        discard: ['atst']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        discard: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Jango attacks Wampa and is defeated
                context.player1.clickCard(context.jangoFettStraightShooter);
                context.player1.clickCard(context.wampa);

                // Discard Battlefield Marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // No event in own discard pile to return, other cards are untouched
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.atst).toBeInZone('discard');
                expect(context.vanquish).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should use the hand and discard pile of the player who controlled him when he was defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['jango-fett#straight-shooter', 'wampa'],
                        discard: ['surprise-strike']
                    },
                    player2: {
                        hand: ['change-of-heart', 'battlefield-marine'],
                        discard: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // P2 steals Jango with Change of Heart
                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.jangoFettStraightShooter);
                expect(context.jangoFettStraightShooter).toBeInZone('groundArena', context.player2);

                // P2 attacks Wampa with Jango and he is defeated
                context.player1.passAction();
                context.player2.clickCard(context.jangoFettStraightShooter);
                context.player2.clickCard(context.wampa);

                // P2 chooses from their own hand
                expect(context.jangoFettStraightShooter).toBeInZone('discard', context.player1);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);

                // P2 discards Battlefield Marine, then can return events from their own discard pile
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.player2).toBeAbleToSelectExactly([context.vanquish, context.changeOfHeart]);

                // P2 returns Vanquish, P1's hand and discard pile are unaffected
                context.player2.clickCard(context.vanquish);
                expect(context.vanquish).toBeInZone('hand', context.player2);
                expect(context.surpriseStrike).toBeInZone('discard', context.player1);
                expect(context.disarm).toBeInZone('hand', context.player1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
