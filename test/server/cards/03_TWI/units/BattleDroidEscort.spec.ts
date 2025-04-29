describe('Battle Droid Escort', function() {
    integration(function(contextRef) {
        describe('Battle Droid Escort\'s ability', function() {
            it('should create a Battle Droid token when played and when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battle-droid-escort']

                    },
                    player2: {
                        hand: ['power-of-the-dark-side'],
                    }
                });

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

            it('should work with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battle-droid-escort'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.battleDroidEscort);

                expect(context.player1.findCardsByName('battle-droid').length).toBe(0);
                expect(context.player2.findCardsByName('battle-droid').length).toBe(1);
            });
        });
    });
});