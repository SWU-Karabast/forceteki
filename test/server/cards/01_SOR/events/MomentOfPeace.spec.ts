describe('Moment of Peace', function() {
    integration(function(contextRef) {
        describe('Moment of Peace\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }]
                    }
                });
            });

            it('can give a shield to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.momentOfPeace);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            });

            it('can give a shield to a unit that already has a shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.momentOfPeace);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['shield', 'shield']);
            });
        });
    });
});
