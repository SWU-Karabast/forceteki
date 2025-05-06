describe('Jedi Knight', function() {
    integration(function(contextRef) {
        it('Jedi Knight\'s ability should deal 2 damage to an enemy ground unit when played with initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasInitiative: true,
                    hand: ['jedi-knight'],
                },
                player2: {
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.jediKnight);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(2);
        });

        it('Jedi Knight\'s ability should not deal damage when played without initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jedi-knight'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['wampa']
                },
            });

            const { context } = contextRef;

            context.player2.passAction();
            context.player1.clickCard(context.jediKnight);
            expect(context.player2).toBeActivePlayer();
        });
    });
});