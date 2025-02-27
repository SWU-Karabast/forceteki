describe('Relentless Firespray', function () {
    integration(function (contextRef) {
        it('Relentless Firespray\'s ability should ready it on its first attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['relentless-firespray'],
                },
            });

            const { context } = contextRef;

            // attack with firespray, should ready the unit
            context.player1.clickCard(context.relentlessFirespray);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.relentlessFirespray.exhausted).toBeFalse();

            context.player2.passAction();

            // attack again with firespray, should be exhausted
            context.player1.clickCard(context.relentlessFirespray);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.relentlessFirespray.exhausted).toBeTrue();

            context.moveToNextActionPhase();

            // new round, attack with firespray, should ready this unit
            context.player1.clickCard(context.relentlessFirespray);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.relentlessFirespray.exhausted).toBeFalse();
        });
    });
});
