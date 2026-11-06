import { captureState } from '../StateCapture';

describe('Render snapshots: board', function() {
    integration(function(contextRef) {
        it('a mirrored board in the action phase', async function () {
            // Both players have the same board, so one participant's view shows every card both as
            // theirs and as their opponent's
            const side = {
                hand: ['open-fire', 'resupply'],
                groundArena: [
                    { card: 'wampa', upgrades: ['experience', 'shield'], damage: 2 },
                    { card: 'battlefield-marine', exhausted: true },
                ],
                spaceArena: ['tieln-fighter'],
                leader: { card: 'leia-organa#alliance-general', deployed: true },
                base: { card: 'nevarro-city', damage: 7 },
                resources: { readyCount: 3, exhaustedCount: 3 },
            };
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: side,
                player2: side,
            });
            const { context } = contextRef;

            captureState(context.game, 'board', ['player1', 'spectator']);
        });
    });
});
