describe('System Shock', function () {
    integration(function (contextRef) {
        it('System Shock\'s ability defeat a non-leader upgrade and deal 1 damage to its parent card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['system-shock'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: [{ card: 'green-squadron-awing', upgrades: ['experience'] }],
                    leader: 'wedge-antilles#leader-of-red-squadron'
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.wedgeAntilles);
            context.player2.clickPrompt('Deploy Wedge Antilles as a Pilot');
            context.player2.clickCard(context.greenSquadronAwing);

            context.player1.clickCard(context.systemShock);
            expect(context.player1).toBeAbleToSelectExactly([context.experience]);
            context.player1.clickCard(context.experience);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(1);
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['wedge-antilles#leader-of-red-squadron']);
        });
    });
});
