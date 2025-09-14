describe('Bog Down In Procedure', function () {
    integration(function (contextRef) {
        describe('Bog Down In Procedure\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bog-down-in-procedure', 'cartel-spacer'], // Cartel Spacer provides Cunning for disclose
                        groundArena: ['pyke-sentinel', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('exhausts a unit, then after disclosing Cunning exhausts another unit (not the first)', function () {
                const { context } = contextRef;

                // Play the event
                context.player1.clickCard(context.bogDownInProcedure);

                // First, choose any unit to exhaust
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine, context.wampa]);

                // Choose enemy Wampa as the first target
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBeTrue();

                // Disclose prompt should appear; reveal a Cunning card (Cartel Spacer)
                // Keep the prompt resilient; only assert selectable cards
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                // Opponent views disclosed card and clicks Done
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.cartelSpacer]);
                context.player2.clickDone();

                // Now choose a second unit to exhaust; cannot select the first unit (Wampa)
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine]);

                // Choose Battlefield Marine as the second target
                context.player1.clickCard(context.battlefieldMarine);

                // Verify both are exhausted, Pyke remains ready
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.pykeSentinel.exhausted).toBeFalse();
            });

            it('allows passing on disclose; only the first chosen unit is exhausted', function () {
                const { context } = contextRef;

                // Play the event
                context.player1.clickCard(context.bogDownInProcedure);

                // First target: exhaust Wampa
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBeTrue();

                // Disclose appears; choose to pass
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                // No second exhaust happens; Pyke remains ready
                expect(context.pykeSentinel.exhausted).toBeFalse();
            });
        });
    });
});