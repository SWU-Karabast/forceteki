import { captureChain } from '../StateCapture';

describe('Control captures: regroup resource, waiting', function() {
    integration(function(contextRef) {
        it('the player without the initiative resources a card first, cancels it, confirms again, and waits for the player with it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                // resourcing spends nothing, and short decks keep the hands each player draws into small
                player1: {
                    hand: ['battlefield-marine'],
                    deck: ['atst', 'atst'],
                    resources: 0,
                    hasInitiative: true,
                },
                player2: {
                    hand: ['wampa'],
                    deck: ['atst', 'atst'],
                    resources: 0,
                },
            });
            const { context } = contextRef;
            context.moveToRegroupPhase();

            const chain = captureChain(context.game, 'regroup-resource-waiting');

            // player2, who does not have the initiative, chooses a card and confirms before player1 has chosen
            chain.step('player2');
            context.player2.clickCard(context.wampa);
            context.player2.clickDone();

            // player2 keeps the card selected, with a disabled Waiting button and a Cancel button, until player1 chooses
            chain.step('player2');
            context.player2.clickPrompt('Cancel');

            // player2 is choosing again, with the card still selected, and confirms it again
            chain.step('player2');
            context.player2.clickDone();

            chain.step('player2');

            chain.step('player1');
            context.player1.clickDone();

            chain.step('player2');
            chain.save();
        });
    });
});
