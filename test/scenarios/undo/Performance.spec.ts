
describe('Undo', function() {
    undoIntegration(function(contextRef) {
        // Spec is disabled by default. Intended to be used with the node debugger and a chrome console to check performance and memory.
        xdescribe('Detached ongoing effect state', function() {
            undoIt(' - Republic attack pod should cost 1 less if there is 3 friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['republic-attack-pod'],
                        groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel'],
                        leader: 'fennec-shand#honoring-the-deal',
                        resources: 6
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past'],
                    }
                });

                debugger;
                const { context } = contextRef;

                const reset = () => {
                    context.player2.clickCard(context.waylay);
                    context.player2.clickCard(context.republicAttackPod);
                    context.player1.readyResources(6);
                };

                // case 1: costs 5 to deploy when 3 units out
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.exhaustedResourceCount).toBe(5);

                reset();

                // case 2: costs 6 to deploy when less than 3 units out (3 units present across board)
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.greedo);
                context.player2.passAction();
                context.player2.passAction();
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                debugger;
            });
        });
    });
});
