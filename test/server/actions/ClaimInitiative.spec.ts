describe('Claim Initiative', function() {
    integration(function (contextRef) {
        describe('when a player has not taken the initiative', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
                return contextRef.setupTestAsync({
                    phase: 'action',
                },
                (context) => {
                    context.player1.claimInitiative();
                });
            });

            it('the non-active player cannot claim the initiative', function () {
                const { context } = contextRef;

                expect(context.player2).toBeActivePlayer();
                expect(context.player2).not.toHaveClaimInitiativeAbilityButton();
            });
        });
    });
});
