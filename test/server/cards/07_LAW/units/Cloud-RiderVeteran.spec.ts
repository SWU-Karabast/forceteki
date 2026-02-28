describe('Cloud-Rider Veteran', function () {
    integration(function (contextRef) {
        describe('Cloud-Rider Veteran\'s ability', function () {
            it('Player 2 Base should take 2 damage On Attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cloudrider-veteran'],
                        base: 'droid-manufactory'
                    },
                    player2: {
                        groundArena: ['duchesss-champion'],
                        base: 'sundari'
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.cloudriderVeteran);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });

            it('Player 1 Base should take 2 damage On Attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cloudrider-veteran'],
                        base: 'droid-manufactory'
                    },
                    player2: {
                        groundArena: ['duchesss-champion'],
                        base: 'sundari'
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.cloudriderVeteran);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});