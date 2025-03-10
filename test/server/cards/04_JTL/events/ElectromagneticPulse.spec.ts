describe('Electromagnetic Pulse', function () {
    integration(function (contextRef) {
        it('Electromagnetic Pulse should Deal 2 damage to a Droid or Vehicle unit and exhaust it.', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['electromagnetic-pulse'],
                    groundArena: ['savage-opress#monster'],
                    spaceArena: ['squadron-of-vultures']
                },
                player2: {
                    groundArena: ['droid-commando', 'relentless-rocket-droid'],
                    spaceArena: ['providence-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.electromagneticPulse);
            expect(context.player1).toBeAbleToSelectExactly([context.squadronOfVultures, context.droidCommando, context.relentlessRocketDroid, context.providenceDestroyer]);
            context.player1.clickCard(context.squadronOfVultures);
            expect(context.squadronOfVultures.exhausted).toBeTrue();
            expect(context.squadronOfVultures.damage).toBe(2);
        });
    });
});
