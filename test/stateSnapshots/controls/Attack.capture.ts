import { captureChain } from '../StateCapture';

describe('Control snapshots: attack', function() {
    integration(function(contextRef) {
        it('a unit attacks and defeats another', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                // an attack spends no resources, and leaving them out keeps every step small
                player1: {
                    groundArena: ['wampa'],
                    resources: 0,
                },
                player2: {
                    groundArena: ['battlefield-marine', 'consular-security-force'],
                    resources: 0,
                },
            });
            const { context } = contextRef;

            const chain = captureChain(context.game, 'attack');

            chain.step('player1');
            context.player1.clickCard(context.wampa);

            chain.step('player1');
            context.player1.clickCard(context.battlefieldMarine);

            chain.step('player1');
            chain.save();
        });
    });
});
