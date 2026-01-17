describe('Fulcrum', function() {
    integration(function(contextRef) {
        it('Fulcrum\'s ability should attach to a non-vehicle unit, give it the Rebel trait, and grant it an ability that gives +2/+2 to other friendly Rebel units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fulcrum', 'rebel-assault'],
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['awing'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fulcrum);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa]);

            context.player1.clickCard(context.wampa);

            // give +2/+2 to other rebel unit
            expect(context.rebelPathfinder.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(5);

            expect(context.awing.getPower()).toBe(1);
            expect(context.awing.getHp()).toBe(2);

            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(7);

            context.player2.passAction();

            // wampa gains Rebel trait
            context.player1.clickCard(context.rebelAssault);
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa]);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.rebelPathfinder);
            context.player1.clickCard(context.p2Base);
        });
    });
});