describe('Merciless Contest', function() {
    integration(function(contextRef) {
        describe('Merciless Contest\'s event ability', function() {
            it('should defeat a non-leader unit picked by each player', () => {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['merciless-contest'],
                        groundArena: ['atst'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.mercilessContest, 'hand');

                    context.player2.passAction();
                };

                // Scenario 1: Both players have a non-leader unit in play
                context.player1.clickCard(context.mercilessContest);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.avenger]);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');

                reset();

                // Scenario 2: Only one player has a non-leader unit in play
                context.player1.clickCard(context.mercilessContest);

                expect(context.player2).toBeAbleToSelectExactly([context.avenger]);
                context.player2.clickCard(context.avenger);

                expect(context.player2).toBeActivePlayer();
                expect(context.avenger).toBeInZone('discard');

                reset();

                // Scenario 3: No non-leader units in play
                context.player1.clickCard(context.mercilessContest);

                expect(context.player2).toBeActivePlayer();

                reset();
            });
        });
    });
});
