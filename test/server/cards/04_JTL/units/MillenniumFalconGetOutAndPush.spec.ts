describe('Millennium Falcon, Get Out And Push', function() {
    integration(function(contextRef) {
        it('Millennium Falcon\'s ability should allow to play an additional pilot on it and give it +1/+0 for each pilot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wingman-victor-two#mauler-mithel', 'wingman-victor-three#backstabber', 'bb8#happy-beeps'],
                    spaceArena: ['millennium-falcon#get-out-and-push']
                },
            });

            const { context } = contextRef;

            expect(context.millenniumFalcon.getPower()).toBe(3);
            expect(context.millenniumFalcon.getHp()).toBe(4);

            // Play first pilot
            context.player1.clickCard(context.wingmanVictorThree);
            context.player1.clickPrompt('Play Wingman Victor Three with Piloting');
            context.player1.clickCard(context.millenniumFalcon);

            expect(context.millenniumFalcon.getPower()).toBe(5);
            expect(context.millenniumFalcon.getHp()).toBe(5);

            context.player2.passAction();

            // Play second pilot
            context.player1.clickCard(context.wingmanVictorTwo);
            context.player1.clickPrompt('Play Wingman Victor Two with Piloting');
            context.player1.clickCard(context.millenniumFalcon);

            expect(context.millenniumFalcon.getPower()).toBe(7);
            expect(context.millenniumFalcon.getHp()).toBe(6);

            context.player2.passAction();

            // Play third pilot on a different vehicle
            context.player1.clickCard(context.bb8);
            context.player1.clickPrompt('Play BB-8 with Piloting');

            expect(context.player1).toBeAbleToSelectExactly(['tie-fighter']);

            context.player1.clickCard('tie-fighter');
            context.player1.passAction();

            expect(context.millenniumFalcon.getPower()).toBe(7);
            expect(context.millenniumFalcon.getHp()).toBe(6);
        });
    });
});
