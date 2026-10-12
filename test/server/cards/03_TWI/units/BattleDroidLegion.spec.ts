describe('Battle Droid Legion', function() {
    integration(function(contextRef) {
        describe('Battle Droid Legion\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
                context.player2.clickCard(context.battleDroidLegion);

                const battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(3);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });

        it('should create the Battle Droid tokens for the opponent when defeated with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battle-droid-legion']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.battleDroidLegion);

            expect(context.battleDroidLegion).toBeInZone('discard', context.player1);
            expect(context.player1.findCardsByName('battle-droid').length).toBe(0);

            const battleDroids = context.player2.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(3);
            expect(battleDroids).toAllBeInZone('groundArena', context.player2);
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            expect(context.player1).toBeActivePlayer();
        });
    });
});