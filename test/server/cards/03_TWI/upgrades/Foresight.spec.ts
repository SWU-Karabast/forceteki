describe('Foresight', function () {
    integration(function (contextRef) {
        it('Foresight ability should give overwhelm to attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['foresight'] }],
                    deck: ['millennium-falcon#piece-of-junk', 'battlefield-marine', 'atst', 'resupply']
                },
            });

            const { context } = contextRef;

            // move to regroup phase
            context.player1.passAction();
            context.player2.passAction();

            // should name a card
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Millennium Falcon');
            context.player1.clickPrompt('Done');

            // top card is millennium falcon, can reveal and draw
            expect(context.player1).toHavePassAbilityPrompt('Reveal and draw the top card of deck');
            context.player1.clickPrompt('Reveal and draw the top card of deck');
            expect(context.player1.hand.length).toBe(3);

            // move to action phase
            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');

            // move to regroup phase
            context.player1.passAction();
            context.player2.passAction();

            // wrong name, do not prompt to reveal and draw
            context.player1.chooseListOption('Wampa');
            context.player1.clickPrompt('Done');
            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
        });
    });
});
