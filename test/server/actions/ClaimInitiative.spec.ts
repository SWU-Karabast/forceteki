describe('Claim Initiative', function() {
    integration(function (contextRef) {
        describe('when a player has not taken the initiative', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                });
            });

            it('the active player can claim the initiative', function () {
                const { context } = contextRef;

                expect(context.player1).toHaveClaimInitiativeAbilityButton();
                context.player1.claimInitiative();

                expect(context.player1).toHaveInitiative();
            });
        });

        describe('when a player has taken the initiative', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                });

                const { context } = contextRef;
                context.player1.claimInitiative();
            });

            it('the active player can claim the initiative', function () {
                const { context } = contextRef;

                expect(context.player2).toBeActivePlayer();
                expect(context.player2).not.toHaveClaimInitiativeAbilityButton();
            });
        });
    });
});
