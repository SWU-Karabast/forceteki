describe('Droid Manufactory', function () {
    integration(function (contextRef) {
        it('Droid Manufactory\'s ability should create 2 battle droid tokens when leader deploys', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    base: 'droid-manufactory',
                    leader: { card: 'rey#more-than-a-scavenger', deployed: false }
                },
                player2: {
                    leader: { card: 'nala-se#clone-engineer', deployed: false }
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.rey);
            context.player1.clickPrompt('Deploy Rey');
            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(2);
        });
    });
});
