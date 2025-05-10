describe('Kanan Jarrus, Help Us Survive', function() {
    integration(function(contextRef) {
        it('Kanan\'s undeployed ability should give a Shield token to a Creature or Spectre unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#attuned-with-life', 'chopper#metal-menace', 'battlefield-marine'],
                    spaceArena: ['the-ghost#spectre-home-base'],
                    leader: 'kanan-jarrus#help-us-survive'
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kananJarrusHelpUsSurvive);
            context.player1.clickPrompt('Give a Shield token to a Creature or Spectre unit.');

            expect(context.player1).toBeAbleToSelectExactly([context.ezraBridgerAttunedWithLife, context.chopperMetalMenace, context.theGhostSpectreHomeBase, context.wampa]);

            context.player1.clickCard(context.ezraBridgerAttunedWithLife);
            expect(context.kananJarrusHelpUsSurvive.exhausted).toBe(true);
            expect(context.ezraBridgerAttunedWithLife).toHaveExactUpgradeNames(['shield']);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Kanan\'s deployed ability should get +2/+2 while controlling another Creature or Spectre unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#attuned-with-life'],
                    leader: { card: 'kanan-jarrus#help-us-survive', deployed: true }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;

            // Kanan should have +2/+2 because Ezra is a Spectre unit
            expect(context.kananJarrusHelpUsSurvive.getPower()).toBe(5); // Base 3 + 2
            expect(context.kananJarrusHelpUsSurvive.getHp()).toBe(8); // Base 6 + 2
        });

        it('Kanan\'s deployed ability should get +2/+2 while controlling another Creature or Spectre unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    leader: { card: 'kanan-jarrus#help-us-survive', deployed: true }
                },
                player2: {
                    groundArena: ['ezra-bridger#attuned-with-life'],
                }
            });
            const { context } = contextRef;

            // Kanan should have +2/+2 because Wampa is a Creature unit
            expect(context.kananJarrusHelpUsSurvive.getPower()).toBe(5); // Base 3 + 2
            expect(context.kananJarrusHelpUsSurvive.getHp()).toBe(8); // Base 6 + 2
        });

        it('Kanan\'s deployed ability should not get +2/+2 without another Creature or Spectre unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'kanan-jarrus#help-us-survive', deployed: true }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Kanan should not have +2/+2 because there's no other Creature or Spectre unit
            expect(context.kananJarrusHelpUsSurvive.getPower()).toBe(3); // Base 3
            expect(context.kananJarrusHelpUsSurvive.getHp()).toBe(6); // Base 6
        });
    });
});