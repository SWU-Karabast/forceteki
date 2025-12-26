describe('Leia\'s Disguise', function () {
    integration(function (contextRef) {
        it('Leia\'s Disguise can only attach to non-Vehicle units and grants Underworld trait to the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leias-disguise', 'ma-klounkee'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['inspectors-shuttle']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            // Play Leia's Disguise — can NOT target Vehicles
            context.player1.clickCard(context.leiasDisguise);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

            // Attach to a non-Vehicle unit and gain Underworld trait
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.maKlounkee);

            // battlefield marine has gained Underworld trait
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);
        });

        it('Leia\'s Disguise, when attached to Leia Organa, should give a Shield to a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leias-disguise'],
                    groundArena: ['leia-organa#defiant-princess', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Attach to Leia Organa
            context.player1.clickCard(context.leiasDisguise);
            expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana, context.battlefieldMarine]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.leiaOrgana);

            // Conditional on-play effect should trigger: give a Shield to a friendly unit
            expect(context.player1).toHavePrompt('Give a Shield token to a friendly unit');
            // Can shield Leia or another friendly unit
            expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.leiasDisguise).toBeAttachedTo(context.leiaOrgana);
        });

        it('Leia\'s Disguise does not offer a Shield if attached to a non-Leia unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leias-disguise'],
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiasDisguise);
            context.player1.clickCard(context.battlefieldMarine);

            // No prompt to give Shield should appear; turn passes
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).not.toHaveExactUpgradeNames(['shield']);
        });
    });
});
