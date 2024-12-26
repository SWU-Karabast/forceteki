describe('Zorii Bliss', function() {
    integration(function(contextRef) {
        describe('Zorii Bliss\'s ability', function() {
            it('draws a card on attack and discards a card at the start of the regroup phase even if zorii dies', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['zorii-bliss#valiant-smuggler'],
                        hand: ['volunteer-soldier'],
                        deck: ['battlefield-marine', 'wampa', 'pyke-sentinel']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Attack with Zorii and draw a card; create delayed discard
                context.player1.clickCard(context.zoriiBliss);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hand.length).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.zoriiBliss);

                // Move to regroup phase
                context.moveToRegroupPhase();

                // Player 1 should now discard a card
                expect(context.player1).toHavePrompt('Choose a card to discard');
                expect(context.player1).toBeAbleToSelectExactly([context.volunteerSoldier, context.battlefieldMarine]);
                context.player1.clickCard(context.volunteerSoldier);
                expect(context.volunteerSoldier).toBeInZone('discard', context.player1);

                // Verify we move on to regroup phase
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Pass again to make sure we don't have to discard again
                expect(context.player1).toBeActivePlayer();

                // Verify we move on to regroup phase again
                context.moveToRegroupPhase();
                expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
            });
        });

        describe('Zorii Bliss\'s ability', function() {
            it('draws a card on attack and has no card to discard', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['zorii-bliss#valiant-smuggler'],
                        hand: [],
                        deck: ['battlefield-marine', 'wampa', 'pyke-sentinel']
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // Attack with Zorii and draw a card; create delayed discard
                context.player1.clickCard(context.zoriiBliss);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hand.length).toBe(1);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.zoriiBliss);

                context.player1.clickCard(context.battlefieldMarine);

                // Move to regroup phase
                context.moveToRegroupPhase();

                // Nothing to discard here as Player 1's hand is empty despite auto resolve being off

                // Verify we move on to regroup phase
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Pass again to make sure we don't have to discard again
                expect(context.player1).toBeActivePlayer();

                // Verify we move on to regroup phase again
                context.moveToRegroupPhase();
                expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
            });
        });
    });
});
