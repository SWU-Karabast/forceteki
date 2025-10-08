describe('Jam Communications', function () {
    integration(function (contextRef) {
        it('Jam Communications should allow to Look at an opponent\'s hand and discard an event from it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jam-communications'],
                    groundArena: ['savage-opress#monster'],
                    spaceArena: ['squadron-of-vultures']
                },
                player2: {
                    hand: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'inferno-four#unforgetting'],
                }
            });

            const { context } = contextRef;

            // Check that all cards in hand are displayed, with correct selectable state
            context.player1.clickCard(context.jamCommunications);
            expect(context.player1).toHaveExactDisplayPromptCards({
                invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour],
                selectable: [context.waylay]
            });
            expect(context.player1).not.toHaveEnabledPromptButton('Done');

            // Check that cards are revealed in chat
            expect(context.getChatLogs(1)[0]).toEqual(
                'player1 plays Jam Communications to look at the opponent\'s hand and sees Sabine Wren, Battlefield Marine, Waylay, and Inferno Four',
            );

            context.player1.clickCardInDisplayCardPrompt(context.waylay);
            expect(context.waylay).toBeInZone('discard');

            context.player2.passAction();
            context.player1.moveCard(context.jamCommunications, 'hand');

            // No choice here so no prompt, but the player still sees an opponent hand reveal
            context.player1.clickCard(context.jamCommunications);
            expect(context.player1).toHaveExactDisplayPromptCards({
                invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour]
            });
            context.player1.clickDone();
        });
    });
});
