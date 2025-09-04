describe('Dhani Pilgrim', function() {
    integration(function(contextRef) {
        it('Dhani Pilgrim\'s when played ability should heal 1 damage from your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dhani-pilgrim'],
                    base: { card: 'echo-base', damage: 2 }
                }
            });

            const { context } = contextRef;

            expect(context.p1Base.damage).toBe(2);
            context.player1.clickCard(context.dhaniPilgrim);
            expect(context.p1Base.damage).toBe(1);
        });

        it('Dhani Pilgrim\'s when defeated ability should heal 1 damage from your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['dhani-pilgrim'],
                    base: { card: 'echo-base', damage: 3 }
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            expect(context.p1Base.damage).toBe(3);

            // Defeat Dhani Pilgrim to trigger when defeated ability
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.dhaniPilgrim);

            expect(context.p1Base.damage).toBe(2);
        });

        it('Dhani Pilgrim\'s when defeated ability should heal 1 damage from enemy base when defeated with No Glory Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    base: { card: 'echo-base', damage: 3 },
                },
                player2: {
                    groundArena: ['dhani-pilgrim'],
                    base: { card: 'jabbas-palace', damage: 5 },
                }
            });

            const { context } = contextRef;

            // Player 1 takes control of enemy Dhani Pilgrim and defeats it
            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.dhaniPilgrim);

            // Dhani Pilgrim's when defeated heals the controller's base (player1)
            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(2);
        });
    });
});
