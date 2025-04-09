describe('The Force', function() {
    integration(function (contextRef) {
        it('maybe works', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'shadowed-undercity',
                    leader: 'darth-maul#sith-revealed',
                    groundArena: [
                        'darth-vader#commanding-the-first-legion'
                    ]
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.darthVader);
            context.player1.clickCard(context.p2Base);

            expect(context.player1.hasTheForce).toBe(true);

            context.player2.passAction();
            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Deal 1 damage to a unit and 1 damage to a different unit');

            context.player1.clickCard(context.darthVader);
            context.player1.clickPrompt('Done');

            expect(context.darthVader.damage).toBe(1);

            expect(context.player1.hasTheForce).toBe(false);
        });
    });
});
