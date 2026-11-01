import { captureState } from './StateCapture';

describe('State snapshots: attack', function() {
    integration(function(contextRef) {
        it('a unit attacks and defeats another', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', { card: 'battlefield-marine', exhausted: true }],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'consular-security-force'],
                },
            });
            const { context } = contextRef;

            captureState(context.game, 'attack/action-window');

            context.player1.clickCard(context.wampa);
            captureState(context.game, 'attack/choose-target');

            context.player1.clickCard(context.player2.findCardByName('battlefield-marine'));
            captureState(context.game, 'attack/after-defeat');
        });
    });
});
