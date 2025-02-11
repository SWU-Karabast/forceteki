describe('Bravado', function () {
    integration(function (contextRef) {
        it('Bravado readies unit with cost reduction when smuggled', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'tech#source-of-insight'],
                    hand: ['takedown', 'bravado']
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            context.player1.moveCard(context.bravado, 'resource');
            context.player1.readyResources(10);

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            // Base cost of 5 plus Tech cost add-on of 2, minus Bravado cost reduction of 2
            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.battlefieldMarine.exhausted).toBe(false);
        });
    });
});