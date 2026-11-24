describe('Eighth Brother, Ill-Fated Escape', function () {
    integration(function (contextRef) {
        describe('Eighth Brother\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['eighth-brother#illfated-escape', { card: 'cell-block-guard', exhausted: true }, 'battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'viper-probe-droid', exhausted: true }]
                    }
                });
            });

            it('should ready an exhausted friendly Imperial unit when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eighthBrother);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Ready an Imperial unit');
                expect(context.player1).toBeAbleToSelectExactly([context.cellBlockGuard, context.tielnFighter, context.viperProbeDroid]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cellBlockGuard);

                expect(context.cellBlockGuard.exhausted).toBeFalse();
                expect(context.eighthBrother).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready an unexhausted friendly Imperial unit when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eighthBrother);
                context.player1.clickCard(context.wampa);

                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter.exhausted).toBeFalse();
                expect(context.eighthBrother).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should trigger its ability for its controller when defeated after being taken control of by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['eighth-brother#illfated-escape', { card: 'cell-block-guard', exhausted: true }, 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: [{ card: 'viper-probe-droid', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.eighthBrother);

            // Eighth Brother is controlled by player2 when defeated, so player2 controls the triggered ability
            expect(context.player2).toHavePrompt('Ready an Imperial unit');
            expect(context.player2).toBeAbleToSelectExactly([context.cellBlockGuard, context.viperProbeDroid]);
            context.player2.clickCard(context.viperProbeDroid);

            expect(context.viperProbeDroid.exhausted).toBeFalse();
            expect(context.eighthBrother).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
