describe('Insurgent Saboteurs', function () {
    integration(function (contextRef) {
        it('Insurgent Saboteurs\' ability should defeat an upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['independent-smuggler'],
                    groundArena: ['insurgent-saboteurs'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['the-darksaber'] }
                }
            });

            const { context } = contextRef;

            // add a pilot to the test
            context.player1.clickCard(context.independentSmuggler);
            context.player1.clickPrompt('Play Independent Smuggler with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.insurgentSaboteurs);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Defeat an upgrade');
            expect(context.player1).toBeAbleToSelectExactly([context.independentSmuggler, context.experience, context.theDarksaber]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.independentSmuggler);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing.isUpgraded()).toBeFalse();
            expect(context.independentSmuggler).toBeInZone('discard');
        });
    });
});
