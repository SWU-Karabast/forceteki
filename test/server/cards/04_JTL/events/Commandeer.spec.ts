describe('Commandeer', function() {
    integration(function(contextRef) {
        describe('Commandeer\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish', 'independent-smuggler'],
                        groundArena: [{ card: 'hailfire-tank', exhausted: true }, { card: 'atst', exhausted: true }],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        hand: ['commandeer'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.greenSquadronAwing);
            });

            it('takes control, ready it and will return enemy non-leader unit to owner\'s hand', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.commandeer);
                expect(context.player2).toBeAbleToSelectExactly([context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.atst.exhausted).toBeFalse();

                // Check that AT-ST returns to player 2
                context.moveToRegroupPhase();
                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control, ready it and stay in discard if defeat', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.commandeer);
                expect(context.player2).toBeAbleToSelectExactly([context.atst]);
                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('discard', context.player1);

                // Check that AT-ST stays in player 2 discard
                context.moveToRegroupPhase();
                expect(context.atst).toBeInZone('discard', context.player1);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });
        });
    });
});
