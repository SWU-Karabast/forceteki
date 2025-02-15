describe('No Glory, Only Results', function() {
    integration(function(contextRef) {
        it('No Glory, Only Results\'s ability should defeat an enemy space unit with 3 or less remaining hp and give an experience token to a unit', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['oomseries-officer'],
                },
                player2: {
                    groundArena: ['superlaser-technician'],
                    spaceArena: ['senatorial-corvette'],
                    hand: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays No Glory, Only Results
            context.player1.clickCard(context.noGloryOnlyResults);
            expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.senatorialCorvette, context.oomseriesOfficer]);

            // Choose Superlaser Technician and defeat it
            context.player1.clickCard(context.superlaserTechnician);
            context.player1.clickPrompt('Put Superlaser Technician into play as a resource and ready it');
            expect(context.superlaserTechnician).toBeInZone('resource', context.player1);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 plays No Glory, Only Results
            context.player1.moveCard(context.noGloryOnlyResults, 'hand');
            context.player1.clickCard(context.noGloryOnlyResults);
            expect(context.player1).toBeAbleToSelectExactly([context.senatorialCorvette, context.oomseriesOfficer]);

            // Choose OOM-Series Officer and defeat it
            context.player1.clickCard(context.oomseriesOfficer);
            context.player1.clickCard(context.p2Base);
            expect(context.oomseriesOfficer).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(2);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 plays No Glory, Only Results
            context.player1.moveCard(context.noGloryOnlyResults, 'hand');
            context.player1.clickCard(context.noGloryOnlyResults);
            expect(context.player1).toBeAbleToSelectExactly([context.senatorialCorvette]);

            // Choose Senatorial Corvette and defeat it
            context.player1.clickCard(context.senatorialCorvette);
            expect(context.senatorialCorvette).toBeInZone('discard');

            context.player2.clickCard(context.cartelSpacer);
            expect(context.cartelSpacer).toBeInZone('discard');
        });
    });
});
