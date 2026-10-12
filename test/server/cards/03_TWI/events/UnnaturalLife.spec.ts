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
                expect(context.player2).toHavePrompt('Choose a unit to play that was defeated this phase from your discard pile. It costs 2 resources less and enters play ready.');
                expect(context.player2).toBeAbleToSelectExactly([context.zuckuss]);

                context.player2.clickCard(context.zuckuss);
                expect(context.zuckuss.exhausted).toBeFalse();
                expect(context.player2.exhaustedResourceCount).toBe(6);
                expect(context.player2.readyResourceCount).toBe(1);

                // Check that Zuckuss is defeated at the beginning of the regroup phase
                context.moveToRegroupPhase();
                expect(context.zuckuss).toBeInZone('discard');

                context.player1.clickDone();
                context.player2.clickDone();

                // Make sure the player can't play Zuckuss again
                context.player1.setHand([context.unnaturalLife]);
                context.player1.passAction();
                context.player2.clickCard(context.unnaturalLife);
                context.player2.clickPrompt('Play anyway');
                expect(context.player1).toBeActivePlayer();
            });
        });

        it('should play a unit that was taken and defeated with No Glory, Only Results from its owner\'s discard pile', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unnatural-life'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // player2 takes control of Wampa and defeats it, it goes to its owner's discard pile
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player1);

            context.player1.clickCard(context.unnaturalLife);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });
    });
});