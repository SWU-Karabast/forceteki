describe('Cinta Kaz, The Struggle Comes First', function() {
    integration(function(contextRef) {
        it('Cinta Kaz when played ability should initiate attack with a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hand: ['cinta-kaz#the-struggle-comes-first']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cintaKaz);
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa]);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
        });

        it('Cinta Kaz when played ability should initiate attack with a unit (played with Plot)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    leader: 'sabine-wren#galvanized-revolutionary',
                    resources: ['cinta-kaz#the-struggle-comes-first', 'atst', 'atst', 'atst', 'atst', 'atst']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Deploy Sabine Wren');

            expect(context.player1).toHavePassAbilityPrompt('Play Cinta Kaz using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.wampa]);

            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
