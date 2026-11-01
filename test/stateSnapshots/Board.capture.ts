import { captureState } from './StateCapture';

describe('State snapshots: board', function() {
    integration(function(contextRef) {
        it('a busy board in the action phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['open-fire', 'resupply'],
                    groundArena: [
                        { card: 'wampa', upgrades: ['experience', 'shield'], damage: 2 },
                        { card: 'battlefield-marine', exhausted: true },
                    ],
                    spaceArena: ['tieln-fighter'],
                    leader: { card: 'leia-organa#alliance-general', deployed: true },
                    base: { card: 'nevarro-city', damage: 7 },
                    resources: 6,
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: [{ card: 'atst', upgrades: ['entrenched'] }],
                    spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                    leader: 'han-solo#audacious-smuggler',
                    base: { card: 'echo-base', damage: 12 },
                },
            });
            const { context } = contextRef;

            captureState(context.game, 'board/action-window');
        });

        it('the game ends when a base is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    base: { card: 'echo-base', damage: 28 },
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            captureState(context.game, 'game-over/base-defeated');

            // the game-over prompt is the state being captured
            context.ignoreUnresolvedActionPhasePrompts = true;
        });
    });
});
