describe('Commence The Festivities', function() {
    integration(function(contextRef) {
        it('Commence The Festivities\'s ablity should allow attack with +2/+0 when controlling fewer resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commence-the-festivities'],
                    groundArena: ['wampa'],
                    resources: 2,
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                    resources: 5, // More resources than player1
                }
            });

            const { context } = contextRef;

            // Play Commence The Festivities
            context.player1.clickCard(context.commenceTheFestivities);
            context.player1.clickCard(context.wampa);
            // wampa gains saboteur
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(6);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });

        it('Commence The Festivities\'s ablity should allow attack with no bonus when controlling equal or more resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commence-the-festivities'],
                    groundArena: ['wampa'],
                    resources: 5,
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                    resources: 5,
                }
            });

            const { context } = contextRef;

            // Play Commence The Festivities
            context.player1.clickCard(context.commenceTheFestivities);
            context.player1.clickCard(context.wampa);
            // wampa gains saboteur
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
