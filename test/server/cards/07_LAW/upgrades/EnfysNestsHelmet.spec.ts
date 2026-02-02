describe('Enfys Nests Helmet', function() {
    integration(function(contextRef) {
        it('Enfys Nests Helmet\'s ability should attach to a non-vehicle unit and grant it on attack ability that gives +3/+0 to another unit for this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['enfys-nests-helmet'],
                    groundArena: ['rebel-pathfinder', 'wampa'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.enfysNestsHelmet);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine]);

            context.player1.clickCard(context.wampa);

            // give +0/+2 to other friendly unit
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(7);

            context.player2.passAction();

            // attack with wampa
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            // should be able to target another unit
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.awing, context.battlefieldMarine]);
            context.player1.clickCard(context.rebelPathfinder);

            // rebel pathfinder should gain +3/+0 for this phase
            expect(context.rebelPathfinder.getPower()).toBe(5);
            expect(context.rebelPathfinder.getHp()).toBe(3);

            // end of phase
            context.moveToNextActionPhase();

            // rebel pathfinder should lose the bonus
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
        });
    });
});