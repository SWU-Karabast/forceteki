describe('Unnatural Life', function() {
    integration(function(contextRef) {
        describe('Unnatural Life\'s ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'fleet-lieutenant'],
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                    player2: {
                        hand: ['unnatural-life'],
                        discard: ['4lom#bounty-hunter-for-hire'],
                        groundArena: [{ card: 'zuckuss#bounty-hunter-for-hire', damage: 3 }],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        resources: 7
                    }
                });
            });

            it('should play Zuckuss for 2 less and enter play ready, since he was defeated this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fleetLieutenant);
                context.player1.clickCard(context.zuckuss);
                expect(context.fleetLieutenant).toBeInZone('discard');
                expect(context.zuckuss).toBeInZone('discard');

                context.player2.clickCard(context.unnaturalLife);
                expect(context.player2).toHavePrompt('Choose a unit');
                expect(context.player2).toBeAbleToSelectExactly([context.zuckuss]);

                context.player2.clickCard(context.zuckuss);
                expect(context.zuckuss.exhausted).toBeFalse();
                expect(context.player2.exhaustedResourceCount).toBe(6);
                expect(context.player2.readyResourceCount).toBe(1);

                // Check that Zuckuss is defeated at the beginning of the regroup phase
                context.moveToRegroupPhase();
                expect(context.zuckuss).toBeInZone('discard');

                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Make sure the player can't play Zuckuss again
                context.player1.setHand([context.unnaturalLife]);
                context.player1.passAction();
                context.player2.clickCard(context.unnaturalLife);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});