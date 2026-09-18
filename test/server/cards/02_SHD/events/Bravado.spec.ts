describe('Bravado', function () {
    integration(function (contextRef) {
        it('Bravado readies unit with cost reduction when smuggled', async function () {
            await contextRef.setupTestAsync({
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

        // Ruling 2025-04-30 (CR 7.7.5D): if an effect replaces a unit's defeat, the unit is not
        // considered defeated. So a replaced defeat does not count toward Bravado's cost reduction.
        xit('does not get its cost reduction when the only enemy "defeat" this phase was replaced (e.g. L3-37 attaches instead)', function () {
            // The opponent's L3-37 (Get Out Of My Seat) "would be defeated" but uses her replacement to
            // attach as a pilot upgrade instead of being defeated. Since no unit was actually defeated,
            // Bravado does not receive its cost reduction.
        });
    });
});