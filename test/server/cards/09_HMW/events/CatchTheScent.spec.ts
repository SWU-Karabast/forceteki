describe('Catch the Scent', function() {
    integration(function(contextRef) {
        it('Catch the Scent\'s ability should make 2 Beasts and ready 1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['catch-the-scent']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.catchTheScent);

            const p1Beasts = context.player1.findCardsByName('beast');
            expect(p1Beasts.length).toBe(2);
            expect(p1Beasts.filter((beast) => beast.exhausted).length).toBe(1);
            expect(p1Beasts.filter((beast) => !beast.exhausted).length).toBe(1);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('Catch the Scent\'s ability should not break if TWI Palp is in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['catch-the-scent'],
                    groundArena: ['chancellor-palpatine#wartime-chancellor']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.catchTheScent);

            const p1Beasts = context.player1.findCardsByName('beast');
            expect(p1Beasts.length).toBe(2);
            expect(p1Beasts.filter((beast) => beast.exhausted).length).toBe(0);
            expect(p1Beasts.filter((beast) => !beast.exhausted).length).toBe(2);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('Catch the Scent\'s ability should only ready 1 Beast with Jerjerrod', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['catch-the-scent'],
                    groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.catchTheScent);
            expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 4 Beast tokens instead');
            context.player1.clickPrompt('Trigger');

            expect(context.moffJerjerrod).toBeInZone('discard');

            const p1Beasts = context.player1.findCardsByName('beast', 'groundArena');
            expect(p1Beasts.length).toBe(4);
            expect(p1Beasts.filter((beast) => beast.exhausted).length).toBe(3);
            expect(p1Beasts.filter((beast) => !beast.exhausted).length).toBe(1);

            const p2Beast = context.player2.findCardsByName('beast', 'groundArena');
            expect(p2Beast.length).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });
    });
});