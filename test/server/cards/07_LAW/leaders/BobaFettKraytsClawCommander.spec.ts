describe('Boba Fett, Krayt\'s Claw Commander', function() {
    integration(function(contextRef) {
        describe('Boba Fett\'s leader undeployed ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#krayts-claw-commander',
                        groundArena: ['hunter-for-hire', 'wampa']
                    },
                    player2: {
                        groundArena: ['4lom#devious', 'atst', 'battlefield-marine'],
                    }
                });
            });

            const promptText = 'You may exhaust Boba Fett. If you do, create a Credit token.';

            it('can create a credit token when a friendly Bounter Hunter unit defeats a unit on attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hunterForHire);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt(promptText);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.credits).toBe(1);
                expect(context.bobaFett.exhausted).toBeTrue();
            });
        });
    });
});
