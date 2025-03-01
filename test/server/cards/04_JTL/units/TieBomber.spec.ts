describe('TIE Bomber', function () {
    integration(function (contextRef) {
        it('should deal 3 indirect damaged when attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['tie-bomber'],
                },
                player2: {
                    groundArena: ['pyke-sentinel'],
                    spaceArena: ['inferno-four#unforgetting'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tieBomber);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeAbleToSelectExactly([context.pykeSentinel, context.infernoFour, context.p2Base]);

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.pykeSentinel, 1],
                [context.p2Base, 2],
            ]));

            expect(context.infernoFour.damage).toBe(0);
            expect(context.pykeSentinel.damage).toBe(1);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});