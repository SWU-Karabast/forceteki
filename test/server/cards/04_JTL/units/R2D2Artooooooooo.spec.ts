describe('R2-D2, Artooooooooo!', function() {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['r2d2#artooooooooo', 'wingman-victor-two#mauler-mithel'],
                    spaceArena: ['cartel-spacer'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
        });

        it('R2-D2\'s ability should allow to play an additional pilot on the attached unit', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.r2d2);
            context.player1.clickPrompt('Play R2-D2 with Piloting');
            context.player1.clickCard(context.cartelSpacer);

            expect(context.cartelSpacer).toHaveExactUpgradeNames([
                'r2d2#artooooooooo',
            ]);

            context.player2.passAction();

            context.player1.clickCard(context.wingmanVictorTwo);
            context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
            context.player1.clickCard(context.cartelSpacer);

            expect(context.cartelSpacer).toHaveExactUpgradeNames([
                'r2d2#artooooooooo',
                'wingman-victor-two#mauler-mithel',
            ]);
        });

        it('R2-D2\'s ability should allow it to be played on a friedly vehicle with a pilot on it', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.wingmanVictorTwo);
            context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
            context.player1.clickCard(context.cartelSpacer);

            context.player2.passAction();

            expect(context.cartelSpacer).toHaveExactUpgradeNames([
                'wingman-victor-two#mauler-mithel',
            ]);

            context.player1.clickCard(context.r2d2);
            context.player1.clickPrompt('Play R2-D2 with Piloting');
            context.player1.clickCard(context.cartelSpacer);

            expect(context.cartelSpacer).toHaveExactUpgradeNames([
                'r2d2#artooooooooo',
                'wingman-victor-two#mauler-mithel',
            ]);
        });
    });
});
