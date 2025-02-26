describe('Infantry of the 212th', function () {
    integration(function (contextRef) {
        it('should gain Sentinel keyword when Coordinate requirement is met', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['infantry-of-the-212th', 'atat-suppressor'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                    leader: { card: 'mace-windu#vaapad-form-master', deployed: true }
                },
            });
            const { context } = contextRef;

            // Check Coordinate requirement is not met yet
            const doesNotHaveSentinel = context.infantryOfThe212th.keywords.every((keyword) => keyword.name !== 'sentinel');
            expect(doesNotHaveSentinel).toBe(true);

            // Check that Coordinate requirement is met after adding new unit to the board
            context.player1.clickCard(context.wampa);
            const doesHaveSentinel = context.infantryOfThe212th.keywords.some((keyword) => keyword.name === 'sentinel');
            expect(doesHaveSentinel).toBe(true);

            // Check that only the Infantry of the 212th can be targeted
            context.player2.clickCard(context.maceWindu);
            expect(context.player2).toBeAbleToSelectExactly([context.infantryOfThe212th]);
            context.player2.clickCard(context.infantryOfThe212th);
            context.player1.passAction();

            // Check targeting is back to normal
            context.player2.clickCard(context.specforceSoldier);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atatSuppressor, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });
    });
});