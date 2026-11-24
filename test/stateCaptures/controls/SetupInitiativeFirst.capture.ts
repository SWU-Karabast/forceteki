import { captureChain } from '../StateCapture';

describe('Control captures: setup, the player with the initiative choosing first in the mulligan', function() {
    integration(function(contextRef) {
        it('the player without the initiative keeps first and cancels, sees the mulligan, and keeps', async function () {
            await contextRef.setupTestAsync({
                phase: 'setup',
                // just enough cards for a starting hand and a mulligan; the setup shuffles, so the seed is fixed
                player1: {
                    deck: ['wampa', 'wampa', 'atst', 'atst', 'battlefield-marine', 'battlefield-marine', 'pyke-sentinel', 'pyke-sentinel'],
                },
                player2: {
                    deck: ['wampa', 'wampa', 'atst', 'atst', 'battlefield-marine', 'battlefield-marine', 'pyke-sentinel', 'pyke-sentinel'],
                },
            });
            const { context } = contextRef;
            context.game.setRandomSeed('setup-initiative-first');
            context.selectInitiativePlayer(context.player1);

            const chain = captureChain(context.game, 'setup-initiative-first');

            // player2, without the initiative, is shown that player1 has not chosen, and keeps first
            chain.step('player2');
            context.player2.clickPrompt('Keep');

            // player2 waits on player1, and cancels
            chain.step('player2');
            context.player2.clickPrompt('Cancel');

            chain.step('player2');

            chain.step('player1');
            context.player1.clickPrompt('Mulligan');

            // player2 is shown that player1 took a mulligan, and keeps
            chain.step('player2');
            context.player2.clickPrompt('Keep');

            // the resource step, where neither player chooses first
            chain.step('player2');
            chain.save();
        });
    });
});
