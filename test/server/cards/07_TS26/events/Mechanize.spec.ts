describe('Mechanize', function() {
    integration(function(contextRef) {
        it('Mechanize\'s ability should play a Non-Vehicle unit from our discard and give Experience to it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mechanize'],
                    discard: ['atst', 'wampa'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'energy-conversion-lab'
                },
                player2: {
                    discard: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mechanize);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });
    });
});
