describe('Pyke Sarisa', function() {
    integration(function(contextRef) {
        describe('Pyke Sarisa\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pyke-sarisa'],
                        leader: { card: 'director-krennic#aspiring-to-authority', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                });
            });

            it('should give any one target unit sentinel for the rest of the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pykeSarisa);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSarisa, context.directorKrennic, context.wampa, context.cartelSpacer]);

                context.player1.clickCard(context.directorKrennic);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.directorKrennic);
                expect(context.directorKrennic.damage).toBe(4);
                expect(context.wampa.damage).toBe(2);

                context.moveToNextActionPhase();

                // should no longer have sentinel
                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.directorKrennic, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});