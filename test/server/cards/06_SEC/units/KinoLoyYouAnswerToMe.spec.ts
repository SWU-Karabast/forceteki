describe('Kino Loy, You Answer To Me', function () {
    integration(function (contextRef) {
        it('Kino Loy\'s should gains +1/+0 for each exhausted other friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }, 'battlefield-marine', 'kino-loy#you-answer-to-me'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                },
                player2: {
                    groundArena: [{ card: 'specforce-soldier', exhausted: true }],
                    spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kinoLoy);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);

            expect(context.kinoLoy.getPower()).toBe(3);
            expect(context.kinoLoy.getHp()).toBe(5);

            context.player2.passAction();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.kinoLoy.getPower()).toBe(4);
            expect(context.kinoLoy.getHp()).toBe(5);
        });
    });
});