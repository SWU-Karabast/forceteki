describe('Diversion', function () {
    integration(function (contextRef) {
        it('Diversion\'s ability should give Sentinel to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['phoenix-squadron-awing', 'victor-leader#leading-from-the-front'],
                },
                player2: {
                    hand: ['diversion'],
                    spaceArena: ['green-squadron-awing'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.phoenixSquadronAwing);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.greenSquadronAwing]);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);

            context.player2.clickCard(context.diversion);
            expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.victorLeader, context.phoenixSquadronAwing]);
            context.player2.clickCard(context.greenSquadronAwing);

            context.player1.clickCard(context.victorLeader);
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(2);
            expect(context.victorLeader.damage).toBe(1);
        });
    });
});
