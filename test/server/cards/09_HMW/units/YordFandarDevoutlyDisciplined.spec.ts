describe('Yord Fandar, Devoutly Disciplined', function() {
    integration(function(contextRef) {
        it('', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['yord-fandar#devoutly-disciplined'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.yordFandar, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    base: { card: 'jabbas-palace', damage: 15 }
                },
                player2: {
                    groundArena: ['yord-fandar#devoutly-disciplined'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.yordFandar]);
            context.player1.clickCard(context.yordFandar);

            expect(context.player2).toBeActivePlayer();
        });

        it('', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['yord-fandar#devoutly-disciplined'],
                    base: { card: 'jabbas-palace', damage: 15 }
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.yordFandar]);
            context.player1.clickCard(context.yordFandar);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
