import { OpponentResourceChoice } from '../../../server/game/core/gameSteps/PromptInterfaces';
import { QuickUndoAvailableState } from '../../../server/game/core/snapshot/SnapshotInterfaces';

describe('Undo in the regroup phase\'s resource step', function() {
    undoIntegration(function(contextRef) {
        const resourcePromptText = 'Select between 0 and 1 cards to resource';
        const waitingPromptText = 'Waiting for opponent to choose cards to resource';

        beforeEach(async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    hasInitiative: true,
                },
                player2: {
                    hand: ['wampa'],
                },
                enableConfirmationToUndo: true,
            });

            const { context } = contextRef;
            context.moveToRegroupPhase();
        });

        it('requires the approval of the player without the initiative for the player with it to undo a choice they have been shown', function() {
            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();
            expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.Resourced);

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player1.id)).toBeTrue();
            expect(contextRef.snapshot.availableQuickSnapshotState(context.player1.id)).toBe(QuickUndoAvailableState.RequestUndoAvailable);

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();
            context.player2.clickPrompt('Deny');

            // denied, so player1's choice stands
            expect(context.player1).toHavePrompt(waitingPromptText);
            expect(context.player2).toHavePrompt(resourcePromptText);
            expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.Resourced);

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();
            context.player2.clickPrompt('Allow');

            // allowed, so both players choose again
            expect(context.player1).toHavePrompt(resourcePromptText);
            expect(context.player2).toHavePrompt(resourcePromptText);
            expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.NotChosen);
            expect(context.battlefieldMarine).toBeInZone('hand');

            context.player1.clickDone();
            expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.Passed);
            context.player2.clickDone();

            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.game.currentPhase).toBe('action');
        });

        it('does not require approval for the player without the initiative to undo a choice made first, which their opponent has not been shown', function() {
            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickDone();
            expect(context.player1.currentPrompt().opponentResourceChoice).toBeUndefined();

            expect(contextRef.snapshot.quickRollbackRequiresConfirmation(context.player2.id)).toBeFalse();

            contextRef.snapshot.quickRollback(context.player2.id);

            expect(context.player1).not.toHaveConfirmUndoPrompt();
            expect(context.player2).toHavePrompt(resourcePromptText);
            expect(context.wampa).toBeInZone('hand');

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.game.currentPhase).toBe('action');
        });
    });
});
