describe('Attack Run', function () {
    integration(function (contextRef) {
        describe('Attack Run\'s ability', function () {
            it('should initiate 2 attacks', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['attack-run'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing', 'phoenix-squadron-awing'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.attackRun);
                // should only choose space units
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.phoenixSquadronAwing]);

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);

                context.player1.clickCard(context.phoenixSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should initiate 1 attack if there is not another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['attack-run'],
                        spaceArena: ['green-squadron-awing']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.attackRun);
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.greenSquadronAwing.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
