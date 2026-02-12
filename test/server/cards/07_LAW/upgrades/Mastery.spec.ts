describe('Mastery', function() {
    integration(function(contextRef) {
        describe('Mastery\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mastery'],
                        groundArena: ['rebel-pathfinder'], // unique unit
                        spaceArena: ['cartel-spacer'] // non-unique unit
                    },
                    player2: {
                        groundArena: ['wampa'], // unique unit
                        spaceArena: ['imperial-interceptor'] // non-unique unit
                    }
                });
            });

            it('should attach to any unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                
                // Should be able to target any unit
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.cartelSpacer, context.wampa, context.imperialInterceptor]);
                
                context.player1.clickCard(context.rebelPathfinder);
                
                // Verify the upgrade is attached
                expect(context.mastery).toBeAttachedTo(context.rebelPathfinder);
                expect(context.player2).toBeActivePlayer();
            });

            it('should attach to non-unique units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                
                // Should be able to target any unit
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.cartelSpacer, context.wampa, context.imperialInterceptor]);
                
                context.player1.clickCard(context.cartelSpacer);
                
                // Verify the upgrade is attached to non-unique unit
                expect(context.mastery).toBeAttachedTo(context.cartelSpacer);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work on enemy unique units as well', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                
                // Should be able to target any unit (including enemy)
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.cartelSpacer, context.wampa, context.imperialInterceptor]);
                
                context.player1.clickCard(context.wampa);
                
                // Verify the upgrade is attached to enemy unique unit
                expect(context.mastery).toBeAttachedTo(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
