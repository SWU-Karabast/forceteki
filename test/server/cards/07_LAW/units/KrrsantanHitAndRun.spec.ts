describe('Krrsantan, Hit and Run', function () {
    integration(function (contextRef) {
        describe('Krrsantan, Hit and Run when played ability', function () {
            it('should let the player to return this unit to their hand by discarding 2 cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'wampa'],
                        groundArena: ['krrsantan#hit-and-run'],
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Krrsantan, Hit and Run action ability
                context.player1.clickCard(context.krrsantanHitAndRun);
                context.player1.clickPrompt('Return this unit to your hand');
                expect(context.player1).toHavePrompt('Choose 2 cards to discard for Krrsantan\'s effect');
                expect(context.player1).toBeAbleToSelectExactly(['battlefield-marine', 'wampa']);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                expect(context.krrsantanHitAndRun).toBeInZone('hand', context.player1);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not let the player to return this unit to their hand as player does not have enough cards to discard', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['krrsantan#hit-and-run'],
                    }
                });

                const { context } = contextRef;

                // Player 1 cannot play Krrsantan, Hit and Run action ability as they do not have enough cards to discard
                context.player1.clickCard(context.krrsantanHitAndRun);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                expect(context.krrsantanHitAndRun).toBeInZone('groundArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the player to return this unit to their hand even if it\'s controlled by the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart', 'battlefield-marine', 'wampa'],
                    },
                    player2: {
                        groundArena: [{ card: 'krrsantan#hit-and-run', exhausted: true }],
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Change of Heart to take control of Krrsantan, Hit and Run
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.krrsantanHitAndRun);
                expect(context.krrsantanHitAndRun).toBeInZone('groundArena', context.player1);

                // Player 2 pass action
                context.player2.passAction();

                // Player 1 plays Krrsantan, Hit and Run action ability to return it to owner's hand
                context.player1.clickCard(context.krrsantanHitAndRun);
                expect(context.player1).toHavePrompt('Choose 2 cards to discard for Krrsantan\'s effect');
                expect(context.player1).toBeAbleToSelectExactly(['battlefield-marine', 'wampa']);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                expect(context.krrsantanHitAndRun).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});