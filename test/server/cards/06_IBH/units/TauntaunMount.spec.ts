describe('Tauntaun Mount', function () {
    integration(function (contextRef) {
        it('Tauntaun Mount\'s ability should heal 2 damage from your base when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                },
                player2: {
                    groundArena: ['tauntaun-mount', { card: 'atst', damage: 5 }],
                    base: { card: 'echo-base', damage: 5 },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.tauntaunMount);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });

        it('Tauntaun Mount\'s ability should heal 2 damage from enemy base when defeated with No Glory Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    base: { card: 'echo-base', damage: 5 },
                },
                player2: {
                    groundArena: ['tauntaun-mount', { card: 'atst', damage: 5 }],
                    base: { card: 'jabbas-palace', damage: 5 },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.tauntaunMount);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(3);
        });
    });
});