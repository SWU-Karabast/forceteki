describe('Fly Casual', function () {
    integration(function (contextRef) {
        it('Fly Casual\'s ability should ready a vehicle unit. It can\'t attack base for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fly-casual'],
                    groundArena: [{ card: 'escort-skiff', exhausted: true }],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flyCasual);

            expect(context.player1).toBeAbleToSelectExactly([context.escortSkiff, context.greenSquadronAwing, context.phoenixSquadronAwing]);
            context.player1.clickCard(context.escortSkiff);

            expect(context.player2).toBeActivePlayer();
            expect(context.escortSkiff.exhausted).toBeFalse();

            context.player2.passAction();

            context.player1.clickCard(context.escortSkiff);

            // can't attack base
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
        });
    });
});
