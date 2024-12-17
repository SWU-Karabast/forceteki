describe('Battle Droid Escort', function() {
    integration(function(contextRef) {
        describe('Battle Droid Escort\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battle-droid-escort']

                    },
                    player2: {
                        hand: ['power-of-the-dark-side']
                    }
                });
            });

            it('should create a Battle Droid token when played and when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battleDroidEscort);
                expect(context.player2).toBeActivePlayer();

                let battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();

                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.battleDroidEscort);
                expect(context.battleDroidEscort).toBeInZone('discard');

                battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });
    });
});