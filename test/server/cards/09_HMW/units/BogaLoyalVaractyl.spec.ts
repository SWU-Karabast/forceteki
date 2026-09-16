describe('Boga, Loyal Varactyl', function() {
    integration(function(contextRef) {
        it('should let you play a non-Vehicle unit from your discard pile for 1 less when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boga#loyal-varactyl'],
                    discard: ['wampa', 'atst'],
                    base: 'tarkintown'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boga);

            // AT-ST is a Vehicle and cannot be chosen
            expect(context.player1).toHavePrompt('Choose a non-Vehicle unit in your discard pile not named Boga. For this phase, you may play that unit from your discard pile. It costs 1 resource less')
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            // Wampa can now be played from discard for 1 less (4 -> 3)
            const exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should let you play a non-Vehicle unit from your discard pile for 1 less when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['boga#loyal-varactyl'],
                    discard: ['wampa'],
                    base: 'tarkintown'
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.boga);

            expect(context.boga).toBeInZone('discard', context.player1);

            // cannot choose a card named 'Boga'
            expect(context.boga).toBeInZone('discard', context.player1);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(3); // Wampa costs 4, 1 less
        });

        it('should trigger for the opponent if they take control of Boga and defeat it (No Glory, Only Results)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['boga#loyal-varactyl'],
                    discard: ['battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    discard: ['wampa'],
                    base: 'tarkintown',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.boga);

            // Boga goes to its owner's discard pile
            expect(context.boga).toBeInZone('discard', context.player1);

            // Boga was controlled by player2 when defeated, so player2 resolves the ability and chooses from their own discard pile
            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
            context.player2.clickCard(context.wampa);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player2);
            expect(context.player2.exhaustedResourceCount).toBe(10); // 7 for No Glory (5 + 2 aspect penalty) + 3 for Wampa (4 - 1)
        });

        it('should not let the chosen unit be replayed from discard if it is defeated again', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boga#loyal-varactyl'],
                    discard: ['wampa'],
                    base: 'tarkintown'
                },
                player2: {
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boga);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            // Play Wampa from discard
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);

            // Defeat Wampa
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player1);

            // The effect applied to the previous copy of Wampa; it cannot be played again
            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should not discount the chosen unit if it is played from hand after leaving the discard pile', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boga#loyal-varactyl', 'renewed-friendship'],
                    discard: ['wampa'],
                    base: 'tarkintown',
                    resources: 25
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boga);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            // Return Wampa from discard to hand
            context.player1.clickCard(context.renewedFriendship);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('hand', context.player1);

            context.player2.passAction();

            // Playing Wampa from hand costs full price: the discount only applied to the discard pile copy
            const exhaustedResourceCount = context.player1.exhaustedResourceCount;
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 4);
        });

        it('should not let the chosen unit be played if it returns to discard after leaving it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'tarfful#fighting-from-the-shadowlands',
                    hand: ['boga#loyal-varactyl', 'renewed-friendship'],
                    discard: ['wampa'],
                    base: 'tarkintown'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boga);
            context.player1.clickCard(context.wampa);

            context.player2.claimInitiative();

            // Return Wampa from discard to hand
            context.player1.clickCard(context.renewedFriendship);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('hand', context.player1);

            // Discard Wampa with Tarfful's ability
            context.player1.clickCard(context.tarfful);
            context.player1.clickPrompt('Create a Beast token');
            expect(context.player1).toHavePrompt('Choose a card to discard');
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player1);

            // The effect applied to the previous copy of Wampa; it cannot be played from discard
            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should not let the chosen unit be played from discard in the next phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boga#loyal-varactyl'],
                    discard: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boga);
            context.player1.clickCard(context.wampa);

            context.moveToNextActionPhase();

            expect(context.wampa).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should fizzle if there is no valid unit in the discard pile', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boga#loyal-varactyl'],
                    discard: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.boga);

            // No prompt: the only discard unit is a Vehicle
            expect(context.boga).toBeInZone('groundArena', context.player1);

            context.player2.passAction();

            expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
