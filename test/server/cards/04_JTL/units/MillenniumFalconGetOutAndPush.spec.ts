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

        // Ruling 2024: two pilots (e.g. Chewbacca and Han) can be attached to the Millennium Falcon in
        // either order, including when one is a leader pilot (deployed as an upgrade) and one is a
        // non-leader pilot (played via Piloting).
        xit('allows a leader pilot and a non-leader pilot to be attached to the Falcon in either order', function () {
            // With the Millennium Falcon (Get Out And Push, which can hold an additional pilot), attach
            // a leader pilot (deployed as an upgrade) and a non-leader pilot (played via Piloting).
            // Both orders — leader first then non-leader, and non-leader first then leader — should be
            // legal and result in both pilots attached to the Falcon.
        });
    });
});
