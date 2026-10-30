import HandlerMenuMultipleSelectionPrompt from '../../../server/game/core/gameSteps/prompts/HandlerMenuMultipleSelectionPrompt';

describe('SWU-PGN/1.0 prompt logging switches', function () {
    integration(function (contextRef) {
        // Value: protects=turning recording off for a multiple-selection prompt stays with that prompt; fails_when=the prompt writes pgnLog onto the caller's properties, so a later single-pick prompt built from the same object silently records no MODAL_CHOICE; why_new=nothing checked what the prompt leaves on its caller's object; seam=none; no_claim=the caller's choices array, which the prompt still extends with Done
        it('leaves the caller\'s properties without the recording switch', async function () {
            await contextRef.setupTestAsync({ phase: 'action' });
            const { context } = contextRef;
            context.ignoreUnresolvedActionPhasePrompts = true;
            const properties: Record<string, unknown> = { choices: ['A', 'B'], handler: () => true };

            new HandlerMenuMultipleSelectionPrompt(context.game, context.player1Object, properties);

            expect(properties.pgnLog).toBeUndefined();
        });
    });
});
