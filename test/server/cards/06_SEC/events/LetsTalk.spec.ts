describe('Let\'s Talk', function () {
    integration(function (contextRef) {
        it('Let\'s Talk costs 6 when own unit is waylayed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['waylay', 'lets-talk']
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            context.player1.readyResources(10);

            context.player1.clickCard(context.waylay);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.readyResources(10);

            context.player1.clickCard(context.letsTalk);
            context.player1.clickCard(context.wampa);

            context.player1.clickCard(context.rebelPathfinder);

            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Let\'s Talk selection order matches capture order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['lets-talk']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.readyResources(10);

            context.player1.clickCard(context.letsTalk);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();

            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.rebelPathfinder);

            expect(context.atst).toBeCapturedBy(context.wampa);
            expect(context.rebelPathfinder).toBeCapturedBy(context.battlefieldMarine);

        });
    });
});