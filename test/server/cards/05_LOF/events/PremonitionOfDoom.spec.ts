describe('Premonition of Doom', function() {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['premonition-of-doom'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['grappling-guardian']
                },
                player2: {
                    groundArena: ['the-zillo-beast#awoken-from-the-depths'],
                    spaceArena: ['devastator#inescapable']
                }
            });
        });

        it('exhausts all units the next time the player takes the initiative this phase', function () {
            const { context } = contextRef;

            const allUnits = context.game.getArenaUnits();

            // Player 1 plays Premonition of Doom
            context.player1.clickCard(context.premonitionOfDoom);

            // Player 2 attacks with Devastator
            context.player2.clickCard(context.devastator);
            context.player2.clickCard(context.p1Base);

            // Player 1 claims initiative
            context.player1.claimInitiative();

            // All units should be exhausted
            for (const unit of allUnits) {
                expect(unit.exhausted).toBeTrue();
            }
        });

        it('does not trigger if the opponent claims, and the effect expires at the end of the phase', function () {
            const { context } = contextRef;

            const allUnits = context.game.getArenaUnits();

            // Player 1 plays Premonition of Doom
            context.player1.clickCard(context.premonitionOfDoom);

            // Player 2 claims initiative
            context.player2.claimInitiative();

            // Effect is not triggered by player 2 claiming initiative
            for (const unit of allUnits) {
                expect(unit.exhausted).toBeFalse();
            }

            // Move to the next action phase
            context.moveToNextActionPhase();

            // All units should be ready
            for (const unit of allUnits) {
                expect(unit.exhausted).toBeFalse();
            }

            // Player 2 passes and Player 1 claims the initiative
            context.player2.passAction();
            context.player1.claimInitiative();

            // All units should still be ready
            for (const unit of allUnits) {
                expect(unit.exhausted).toBeFalse();
            }
        });
    });
});