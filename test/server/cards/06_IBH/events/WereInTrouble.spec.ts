describe('We\'re In Trouble', function() {
    integration(function(contextRef) {
        describe('We\'re In Trouble\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['were-in-trouble'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }]
                    }
                });
            });

            it('can damage a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wereInTrouble);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.atst]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
            });

            it('can damage an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wereInTrouble);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.atst]);

                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(3);
            });

            it('can damage a unit with a shield, removing only the shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wereInTrouble);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.atst]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.isUpgraded()).toBe(false);
                expect(context.cartelSpacer.damage).toBe(0);
            });
        });
    });
});