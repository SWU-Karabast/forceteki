import { captureChain } from '../StateCapture';

describe('Control captures: regroup resource', function() {
    integration(function(contextRef) {
        it('the player without the initiative is shown what the player with it chose, then resources a card', async function () {
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

            const chain = captureChain(context.game, 'regroup-resource');

            // player2 is shown that player1, who has the initiative, has not chosen yet
            chain.step('player2');

            chain.step('player1');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();

            // player2 is shown that player1 has resourced a card, and resources one too
            chain.step('player2');
            context.player2.clickCard(context.wampa);
            context.player2.clickDone();

            chain.step('player2');
            chain.save();
        });
    });
});
