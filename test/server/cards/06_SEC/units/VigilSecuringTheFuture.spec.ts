/**
 * TODO: Tests for Vigil:
 * - Decrease combat damage dealt to friendly non-Vigil units by 1
 * - Decrease ability damage dealt to friendly non-Vigil units by 1
 * - Do NOT decrease indirect damage dealt to friendly non-Vigil units by 1
 *
 * - Increase combat damage dealt to Vigil by 1
 * - Increase ability damage dealt to Vigil by 1
 * - Increase indirect damage dealt to Vigil by 1
 *
 * - Can be combined with abilities like Finn and Boba Fett Armor
 */
describe('Vigil, Securing the Future', function() {
    integration(function(contextRef) {
        describe('Vigil, Securing the Future', function() {
            it('', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vigil-securing-the-future', 'cartel-spacer']
                    },
                });

                const { context } = contextRef;

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});