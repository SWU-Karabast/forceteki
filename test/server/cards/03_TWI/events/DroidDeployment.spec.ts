describe('Droid Deployment', function () {
    integration(function (contextRef) {
        it('Droid Deployment\'s ability should create two Battle Droid tokens for the controller', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['droid-deployment'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.droidDeployment);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(2);
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
