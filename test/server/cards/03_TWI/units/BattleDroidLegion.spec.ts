describe('Battle Droid Legion', function() {
    integration(function(contextRef) {
        describe('Battle Droid Legion\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side']

                    },
                    player2: {
                        groundArena: ['battle-droid-legion']
                    }
                });
            });

            it('should create 3 Battle Droid tokens when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeAbleToSelectExactly([context.battleDroidLegion]);

                context.player2.clickCard(context.battleDroidLegion);
                expect(context.battleDroidLegion).toBeInZone('discard');

                const battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(3);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });
    });
});