describe('No Glory, Only Results', function() {
    integration(function(contextRef) {
        it('No Glory, Only Results\'s ability should allow to take control of an enemy unit and defeat it', function() {
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
            expect(context.player1).toBeAbleToSelectExactly([context.oomseriesOfficer, context.senatorialCorvette]);

            // Choose Senatorial Corvette and defeat it
            context.player1.clickCard(context.senatorialCorvette);
            expect(context.senatorialCorvette).toBeInZone('discard');

            context.player2.clickCard(context.cartelSpacer);
            expect(context.cartelSpacer).toBeInZone('discard');
        });

        it('No Glory, Only Results\'s ability should allow to target a friendly unit and defeat it', function() {
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

            // Choose OOM-Series Officer and defeat it
            context.player1.clickCard(context.oomseriesOfficer);
            context.player1.clickCard(context.p2Base);
            expect(context.oomseriesOfficer).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(2);
        });

        it('No Glory, Only Results\'s ability should trigger Snoke ability before defeating it', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                },
                player2: {
                    groundArena: ['superlaser-technician', 'supreme-leader-snoke#shadow-ruler'],
                    spaceArena: ['black-sun-starfighter'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays No Glory, Only Results
            context.player1.clickCard(context.noGloryOnlyResults);
            expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.blackSunStarfighter, context.supremeLeaderSnoke]);

            // Choose Supreme Leader Snoke and defeat it
            context.player1.clickCard(context.supremeLeaderSnoke);
            context.player2.clickPrompt('Put Superlaser Technician into play as a resource and ready it');
            expect(context.supremeLeaderSnoke).toBeInZone('discard');
            expect(context.blackSunStarfighter).toBeInZone('discard');
            expect(context.superlaserTechnician).toBeInZone('resource');
        });
    });
});
