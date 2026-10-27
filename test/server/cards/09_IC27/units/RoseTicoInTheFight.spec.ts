describe('Rose Tico, In the Fight', function() {
    integration(function(contextRef) {
        it('Rose Tico\'s ability may give a Shield token to another Resistance unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rose-tico#in-the-fight', 'bb8#frazzled-friend', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['black-one#straight-at-them']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.bb8, context.blackOne]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.bb8);

            expect(context.bb8).toHaveExactUpgradeNames(['shield']);
            expect(context.roseTico.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
