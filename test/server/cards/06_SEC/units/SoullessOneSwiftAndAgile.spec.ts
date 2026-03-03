describe('Soulless One, Swift and Agile', function() {
    integration(function(contextRef) {
        it('Soulless One\'s ability should disclose Cunning, Cunning, Villainy to ready 2 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cunning', 'atst', 'resupply'],
                    spaceArena: ['soulless-one#swift-and-agile'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resupply);
            const exhaustedResources = context.player1.exhaustedResourceCount;

            context.player2.passAction();

            context.player1.clickCard(context.soullessOne);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Disclose Cunning, Cunning, Villainy to ready 2 resources');
            expect(context.player1).toBeAbleToSelectExactly([context.cunning, context.atst]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickCard(context.cunning);
            context.player1.clickCard(context.atst);
            context.player1.clickDone();

            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.cunning, context.atst]);
            context.player2.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResources - 2);
        });
    });
});