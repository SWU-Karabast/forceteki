describe('It\'s Not Over Yet', function () {
    integration(function (contextRef) {
        it('ready a unit that didn\'t attack or enter this phase, then create a Spy token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['its-not-over-yet', 'battlefield-marine'],
                    groundArena: [
                        { card: 'vanguard-infantry', exhausted: true },
                        'pyke-sentinel'
                    ]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Make Pyke Sentinel attack so it becomes ineligible (attacked this phase)
            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            // Play a unit now so it becomes ineligible (entered play this phase)
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            // Now play the event
            context.player1.clickCard(context.itsNotOverYet);

            // Optional ability prompt appears
            expect(context.player1).toHavePassAbilityPrompt('Ready a unit that didn\'t attack or enter play this phase');
            context.player1.clickPrompt('Trigger');

            // Eligible targets: Vanguard Infantry (exhausted, did not attack/enter) and enemy Wampa (did not attack/enter)
            // Ineligible targets (should not be selectable): Pyke Sentinel (attacked this phase), Battlefield Marine (entered this phase)
            expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry, context.wampa]);

            // Choose Vanguard Infantry to ready it
            context.player1.clickCard(context.vanguardInfantry);
            expect(context.vanguardInfantry.exhausted).toBeFalse();

            // A Spy token should be created for player1, in the ground arena and exhausted
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('may pass the optional ability; no unit is readied and no Spy is created', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['its-not-over-yet'],
                    groundArena: [
                        { card: 'vanguard-infantry', exhausted: true }
                    ]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.itsNotOverYet);

            expect(context.player1).toHavePassAbilityPrompt('Ready a unit that didn\'t attack or enter play this phase');
            context.player1.clickPrompt('Pass');

            // No change: Vanguard Infantry remains exhausted but Spy token are created
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });
    });
});
