describe('Familiar Strategem', function() {
    integration(function(contextRef) {
        it('Familiar Strategem\'s ability should attack with a unit and give it +2/+0 because it shares a trait with another friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['familiar-strategem'],
                    groundArena: ['rebel-pathfinder', 'battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.familiarStrategem);
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('Familiar Strategem\'s ability should attack with a unit but not give it +2/+0 because it does not share a trait with another friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['familiar-strategem'],
                    groundArena: ['criminal-muscle', 'battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.familiarStrategem);
            expect(context.player1).toBeAbleToSelectExactly([context.criminalMuscle, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Familiar Strategem\'s ability should attack with a unit but not give it +2/+0 if it shares a trait with an enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['familiar-strategem'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.familiarStrategem);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});