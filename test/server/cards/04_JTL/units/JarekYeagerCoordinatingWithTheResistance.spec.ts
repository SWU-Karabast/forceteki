describe('Jarek Yeager, Coordinating With The Resistance', function () {
    integration(function (contextRef) {
        it('Jarek Yeager\'s piloting ability should give Sentinel to the attached unit if we control a space unit and a ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jarek-yeager#coordinating-with-the-resistance', 'wampa'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    spaceArena: ['phoenix-squadron-awing', 'victor-leader#leading-from-the-front'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jarekYeager);
            context.player1.clickPrompt('Play Jarek Yeager with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.clickCard(context.phoenixSquadronAwing);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.greenSquadronAwing]);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(4);

            context.player1.clickCard(context.wampa);

            context.player2.clickCard(context.victorLeader);
            expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            context.player2.clickCard(context.greenSquadronAwing);

            expect(context.player1).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(2);
            expect(context.victorLeader.damage).toBe(3); // 1 from awing + 2 from jarek yeager
        });
    });
});
