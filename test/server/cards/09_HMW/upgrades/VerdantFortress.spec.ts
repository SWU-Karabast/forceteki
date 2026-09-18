describe('Verdant Fortress', function() {
    integration(function(contextRef) {
        it('Verdant Fortress\'s ability should give Raid 1 to friendly units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['verdant-fortress'] },
                    groundArena: ['porg', 'battlefield-marine'],
                    spaceArena: ['kit-fistos-aethersprite#good-hunting']
                },
                player2: {
                    groundArena: ['teebo#striped-hunter', 'rey#skywalker'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.rey);

            expect(context.rey.damage).toBe(4);

            context.player2.clickCard(context.rey);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(9);

            context.player1.clickCard(context.kitFistosAethersprite);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
        });
    });
});
