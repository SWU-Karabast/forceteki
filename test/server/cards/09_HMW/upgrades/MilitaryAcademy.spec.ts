describe('Military Academy', function() {
    integration(function(contextRef) {
        it('Military Academy\'s ability should give Overwhelm to friendly units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['military-academy'] },
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
            context.player1.clickCard(context.teebo);

            expect(context.p2Base.damage).toBe(2);

            context.player2.clickCard(context.rey);
            context.player2.clickCard(context.porg);

            expect(context.p1Base.damage).toBe(0);

            context.player1.clickCard(context.kitFistosAethersprite);
            context.player1.clickCard(context.awing);

            expect(context.p2Base.damage).toBe(4);
        });
    });
});
