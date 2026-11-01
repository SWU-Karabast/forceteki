import { captureState } from './StateCapture';

describe('State snapshots: abilities', function() {
    integration(function(contextRef) {
        it('an event chooses a target', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['open-fire'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['tieln-fighter'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.openFire);
            captureState(context.game, 'event-target/choose-target');

            context.player1.clickCard(context.atst);
            captureState(context.game, 'event-target/resolved');
        });

        it('a unit distributes damage among several targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['overwhelming-barrage'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    spaceArena: ['tieln-fighter'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.overwhelmingBarrage);
            context.player1.clickCard(context.wampa);
            captureState(context.game, 'distribute-damage/prompt');

            context.player1.setDistributeDamagePromptState(new Map([
                [context.atst, 4],
                [context.consularSecurityForce, 2],
            ]));
            captureState(context.game, 'distribute-damage/resolved');
        });
    });
});
