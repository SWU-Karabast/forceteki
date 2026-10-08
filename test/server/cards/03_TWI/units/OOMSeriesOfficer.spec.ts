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

            it('should let the new controller choose the base when defeated with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['oomseries-officer'],
                        base: 'droid-manufactory'
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        base: 'sundari',
                        hasInitiative: true
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.oomseriesOfficer);

                // Player 2 controlled the Officer when it was defeated, so they resolve the When Defeated ability
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);
                expect(context.oomseriesOfficer).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
