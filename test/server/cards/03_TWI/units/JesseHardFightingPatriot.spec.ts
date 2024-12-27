describe('Jesse, Hard-Fighting Patriot', function () {
    integration(function (contextRef) {
        describe('Jesse\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['jesse#hardfighting-patriot']
                    }
                });
            });

            it('should create two Battle Droid tokens for the opponent', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jesse);
                expect(context.player2).toBeActivePlayer();

                const battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena', context.player2);
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });
    });
});
