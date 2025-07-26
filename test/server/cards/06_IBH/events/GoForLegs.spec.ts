describe('Go For The Legs', function() {
    integration(function(contextRef) {
        describe('Go For The Legs\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['go-for-the-legs'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'fleet-lieutenant'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('can exhaust an enemy ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.goForTheLegs);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.fleetLieutenant]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel.exhausted).toBe(true);

                context.moveToNextActionPhase();

                // next turn, pyke sentinel should be ready
                expect(context.pykeSentinel.exhausted).toBe(false);
            });

            it('cannot target friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.goForTheLegs);
                expect(context.player1).not.toBeAbleToSelect(context.wampa);
                context.player1.clickCard(context.pykeSentinel);
            });

            it('cannot target enemy space units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.goForTheLegs);
                expect(context.player1).not.toBeAbleToSelect(context.cartelSpacer);
                context.player1.clickCard(context.pykeSentinel);
            });
        });
    });
});