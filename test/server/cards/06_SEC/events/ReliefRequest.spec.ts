describe('Relief Request', function () {
    integration(function (contextRef) {
        describe('Relief Request\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['relief-request', 'repair'],
                        groundArena: [{ card: 'pyke-sentinel', damage: 2 }, { card: 'battlefield-marine', damage: 2 }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }]
                    }
                });
            });

            it('heals a first unit, then after disclosing Vigilance heals another unit', function () {
                const { context } = contextRef;

                // Capture pre-buff stats
                const pykeBaseHP = context.pykeSentinel.remainingHp;
                const marineBaseHP = context.battlefieldMarine.remainingHp;
                const wampaBaseHP = context.wampa.remainingHp;

                // Play the event
                context.player1.clickCard(context.reliefRequest);

                // First, choose a unit to heal 3 damage
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.pykeSentinel);

                // Verify first heal applied immediately
                expect(context.pykeSentinel.remainingHp).toBe(pykeBaseHP + 2);

                // Disclose prompt should appear; reveal a Vigilance card
                // We avoid asserting exact prompt text to keep the test resilient to title formatting.
                expect(context.player1).toBeAbleToSelectExactly([context.repair]);
                context.player1.clickCard(context.repair);

                // Opponent views disclosed cards and clicks Done
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.repair]);
                context.player2.clickPrompt('Done');

                // Now choose a second unit to heal; cannot select the first unit (Pyke)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                // Choose Wampa as the second target
                context.player1.clickCard(context.wampa);

                // Verify second heal applied
                expect(context.wampa.remainingHp).toBe(wampaBaseHP + 3);

                // Ensure other unit unchanged
                expect(context.battlefieldMarine.remainingHp).toBe(marineBaseHP);
            });

            it('allows passing on disclose, only the first unit gets the heal', function () {
                const { context } = contextRef;

                const marineBaseHP = context.battlefieldMarine.remainingHp;
                const pykeBaseHP = context.pykeSentinel.remainingHp;
                const wampaBaseHP = context.wampa.remainingHp;

                // Play event and select Battlefield Marine as the first unit
                context.player1.clickCard(context.reliefRequest);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine, context.wampa
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                // First Heal applied
                expect(context.battlefieldMarine.remainingHp).toBe(marineBaseHP + 2);

                // Disclose appears; choose to pass (Choose nothing)
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                // No further buffs; Pyke remains unchanged
                expect(context.pykeSentinel.remainingHp).toBe(pykeBaseHP);
                expect(context.wampa.remainingHp).toBe(wampaBaseHP);
            });
        });
    });
});