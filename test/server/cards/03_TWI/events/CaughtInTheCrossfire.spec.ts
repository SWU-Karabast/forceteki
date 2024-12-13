describe('Caught In The Crossfire', function() {
    integration(function(contextRef) {
        describe('Caught In The Crossfire\'s event ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
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
            });

            it('should allow to pick 2 enemy units in the same arena and those units will deal damage to each other', () => {
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.caughtInTheCrossfire, 'hand');

                    context.player2.passAction();
                };

                // Scenario 1: Choose two enemy ground units
                context.player1.clickCard(context.caughtInTheCrossfire);

                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.sabineWren, context.cartelSpacer, context.headhunterSquadron, context.avenger]);
                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer]);
                context.player1.clickCard(context.clanWrenRescuer);

                expect(context.player2).toBeActivePlayer();
                expect(context.clanWrenRescuer).toBeInZone('discard');
                expect(context.sabineWren.damage).toBe(1);

                reset();

                // Scenario 2: Choose two enemy space units
                context.player1.clickCard(context.caughtInTheCrossfire);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.headhunterSquadron, context.avenger]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player1).toBeAbleToSelectExactly([context.headhunterSquadron, context.avenger]);
                context.player1.clickCard(context.headhunterSquadron);

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.headhunterSquadron.damage).toBe(2);
            });
        });
    });
});
