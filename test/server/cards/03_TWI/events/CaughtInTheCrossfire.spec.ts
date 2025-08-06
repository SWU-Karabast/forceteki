describe('Caught In The Crossfire', function() {
    integration(function(contextRef) {
        describe('Caught In The Crossfire\'s event ability', function() {
            it('should allow to pick 2 enemy units in the same arena and those units will deal damage to each other', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                        groundArena: ['atst', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['clan-wren-rescuer'],
                        spaceArena: ['cartel-spacer', 'headhunter-squadron', 'avenger#hunting-star-destroyer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.caughtInTheCrossfire, 'hand');

                    context.player2.passAction();
                };

                // Scenario 1: Choose two enemy ground units
                context.player1.clickCard(context.caughtInTheCrossfire);

                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.sabineWren, context.cartelSpacer, context.headhunterSquadron, context.avenger]);
                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.sabineWren]);
                context.player1.clickCard(context.clanWrenRescuer);

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.clanWrenRescuer).toBeInZone('discard');
                expect(context.sabineWren.damage).toBe(1);

                reset();

                // Scenario 2: Choose two enemy space units
                context.player1.clickCard(context.caughtInTheCrossfire);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.headhunterSquadron, context.avenger]);
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.headhunterSquadron);
                context.player1.clickCardNonChecking(context.avenger);

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.headhunterSquadron.damage).toBe(2);

                // TODO: Test with Bravado to confirm that the defeats are not attributed to the controller of Caught in the Crossfire
            });

            it('does nothing if the opponent controls only one unit in an arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                        groundArena: ['atst', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['clan-wren-rescuer'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if the opponent controls no units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                        groundArena: ['atst', 'battlefield-marine'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
