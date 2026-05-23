describe('Bo-Katan Kryze, For All of Mandalore', function() {
    integration(function(contextRef) {
        it('Bo-Katan Kryze\ should deal 2 damage if there is not friendly Mandalorian unit ', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['bokatan-kryze#for-all-of-mandalore'],
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.bokatanKryze);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(2);
        });

        it('Bo-Katan Kryze\'s should have Raid while there is a friendly Mandalorian unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['bokatan-kryze#for-all-of-mandalore', 'sundari-peacekeeper'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.bokatanKryze);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);

            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.bokatanKryze);

            expect(context.player1).toBeActivePlayer();
            expect(context.bokatanKryze.damage).toBe(3);
            expect(context.battlefieldMarine.damage).toBe(2);
        });
    });
});
