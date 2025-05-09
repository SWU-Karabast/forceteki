describe('Ezra Bridger, Attuned With Life', function() {
    integration(function(contextRef) {
        it('Ezra\'s on attack ability should give an Experience token to another Creature or Spectre unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#attuned-with-life', 'chopper#metal-menace', 'battlefield-marine'],
                    spaceArena: ['the-ghost#spectre-home-base']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.ezraBridgerAttunedWithLife);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.chopperMetalMenace, context.theGhostSpectreHomeBase, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.chopperMetalMenace);
            expect(context.chopperMetalMenace).toHaveExactUpgradeNames(['experience']);
        });
    });
});