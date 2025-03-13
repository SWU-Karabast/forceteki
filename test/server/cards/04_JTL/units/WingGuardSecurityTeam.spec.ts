describe('Wing Guard Security Team', function() {
    integration(function(contextRef) {
        it('Wing Guard Security Team\'s ability should give a shield token to up to 2 fringe unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wing-guard-security-team'],
                    groundArena: ['wampa', 'wrecker#boom']
                },
                player2: {
                    spaceArena: ['distant-patroller'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wingGuardSecurityTeam);
            expect(context.player1).toBeAbleToSelectExactly([context.wrecker, context.wingGuardSecurityTeam, context.distantPatroller]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.wrecker);
            context.player1.clickCard(context.distantPatroller);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.wrecker).toHaveExactUpgradeNames(['shield']);
            expect(context.distantPatroller).toHaveExactUpgradeNames(['shield']);
        });
    });
});
