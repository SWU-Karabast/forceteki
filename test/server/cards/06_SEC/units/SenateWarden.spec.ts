describe('Senate Warden', function () {
    integration(function (contextRef) {
        describe('Senate Warden\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown', 'no-glory-only-results'],
                        groundArena: ['atst']
                    },
                    player2: {
                        hand: ['protector'],
                        groundArena: ['senate-warden', 'wampa'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should, after disclosing, give an Experience token to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.senateWarden);

                expect(context.player2).toHavePrompt('Disclose Vigilance to give an Experience token to a unit');
                expect(context.player2).toBeAbleToSelectExactly([context.protector]);
                expect(context.player2).toHaveChooseNothingButton();
                context.player2.clickCard(context.protector);

                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.protector]);
                context.player1.clickDone();

                expect(context.player2).toBeAbleToSelectExactly([context.awing, context.wampa, context.atst]);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            });

            it('should, after disclosing, give an Experience token to a unit (no glory only results)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.senateWarden);

                expect(context.player1).toHavePrompt('Disclose Vigilance to give an Experience token to a unit');
                context.player1.clickCard(context.takedown);

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.takedown]);
                context.player2.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
