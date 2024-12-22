describe('On the Doorstep', function () {
    integration(function (contextRef) {
        it('On the Doorstep\'s ability should create three Battle Droid tokens for the controller and ready them', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['on-the-doorstep'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.onTheDoorstep);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(3);
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.every((battleDroid) => !battleDroid.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
