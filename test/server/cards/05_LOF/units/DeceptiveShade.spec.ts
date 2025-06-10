describe('Deceptive Shade', function () {
    integration(function(contextRef) {
        describe('Deceptive Shade\'s when defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['swoop-racer'],
                        groundArena: ['deceptive-shade'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        hasInitiative: true,
                    },
                });
            });

            it('should give Ambush to the next unit played this phase', function () {
                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // Player 1 plays Swoop Racer
                context.player1.clickCard(context.swoopRacer);
                expect(context.swoopRacer.hasSomeKeyword('ambush')).toBeTrue();
            });
        });
    });
});