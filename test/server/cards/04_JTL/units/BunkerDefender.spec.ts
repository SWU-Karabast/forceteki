describe('Bunker Defender', function () {
    integration(function (contextRef) {
        it('Bunker Defender\'s ability should give it sentinel while he has a Vehicle ally', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['strafing-gunship'],
                    groundArena: ['bunker-defender'],
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.bunkerDefender, context.p1Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(4);

            context.player1.clickCard(context.strafingGunship);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.bunkerDefender]);
            context.player2.clickCard(context.bunkerDefender);
            expect(context.player1).toBeActivePlayer();
            expect(context.bunkerDefender.zoneName).toBe('discard');
            expect(context.battlefieldMarine.damage).toBe(2);
        });
    });
});
