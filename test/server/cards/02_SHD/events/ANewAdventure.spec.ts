describe('A New Adventure', function() {
    integration(function(contextRef) {
        describe('A New Adventure\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['a-new-adventure'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can deal damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.aNewAdventure);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand');
                expect(context.player2).toHavePassAbilityPrompt('Play Wampa for free');
                context.player2.clickPrompt('Play Wampa for free');
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player2.exhaustedResourceCount).toBe(0);
            });
        });
    });
});
