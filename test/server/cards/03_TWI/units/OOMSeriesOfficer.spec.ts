describe('OOM-Series Officer', function () {
    integration(function (contextRef) {
        describe('OOM-Series Officer\'s ability', function () {
            it('Player 2 Base should take 2 damages when Officer is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['oomseries-officer'],
                        base: 'droid-manufactory'
                    },
                    player2: {
                        groundArena: ['duchesss-champion'],
                        base: 'sundari'
                    }
                });
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context.oomseriesOfficer);
                expect(context.player1).toBeAbleToSelectExactly([context.duchesssChampion, context.p2Base]);
                context.player1.clickCard(context.duchesssChampion);

                // Check When Defeated trigger
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.oomseriesOfficer).toBeInZone('discard');
            });
        });
    });
});
