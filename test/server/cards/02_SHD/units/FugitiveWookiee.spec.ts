describe('Fugitive Wookiee', function() {
    integration(function(contextRef) {
        describe('Fugitive Wookiee\'s Bounty ability', function() {
            it('should exhaust a unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['fugitive-wookiee', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fugitiveWookiee);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
