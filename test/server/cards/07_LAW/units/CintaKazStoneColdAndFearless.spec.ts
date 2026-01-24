describe('Cinta Kaz, Stone Cold and Fearless', function() {
    integration(function(contextRef) {
        describe('Cinta Kaz\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'cinta-kaz#stone-cold-and-fearless', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'jedha-agitator'],
                    },
                });
            });

            it('should give it sentinel only as long as it is upgraded', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly(context.cintaKazStoneColdAndFearless);
                context.player2.clickCard(context.cintaKazStoneColdAndFearless);

                expect(context.cintaKazStoneColdAndFearless.damage).toBe(0);
                expect(context.cintaKazStoneColdAndFearless.isUpgraded()).toBe(false);
                expect(context.wampa.damage).toBe(3);

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.jedhaAgitator);

                expect(context.player2).toBeAbleToSelectExactly([context.cintaKazStoneColdAndFearless, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});