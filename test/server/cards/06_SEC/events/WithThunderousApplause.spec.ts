describe('With Thunderous Applause', function () {
    integration(function (contextRef) {
        describe('With Thunderous Applause\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['with-thunderous-applause', 'salvage'], // Salvage provides Command for disclose
                        groundArena: ['pyke-sentinel', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('buffs a first unit, then after disclosing Command buffs another different unit', function () {
                const { context } = contextRef;

                // Capture pre-buff stats
                const pykeBasePower = context.pykeSentinel.getPower();
                const pykeBaseHP = context.pykeSentinel.remainingHp;
                const marineBasePower = context.battlefieldMarine.getPower();
                const marineBaseHP = context.battlefieldMarine.remainingHp;
                const wampaBasePower = context.wampa.getPower();
                const wampaBaseHP = context.wampa.remainingHp;

                // Play the event
                context.player1.clickCard(context.withThunderousApplause);

                // First, choose a unit to get +2/+2 for this phase
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.pykeSentinel);

                // Verify first buff applied immediately
                expect(context.pykeSentinel.getPower()).toBe(pykeBasePower + 2);
                expect(context.pykeSentinel.remainingHp).toBe(pykeBaseHP + 2);

                // Disclose prompt should appear; reveal a Command card (Salvage)
                // We avoid asserting exact prompt text to keep the test resilient to title formatting.
                expect(context.player1).toBeAbleToSelectExactly([context.salvage]);
                context.player1.clickCard(context.salvage);

                // Opponent views disclosed cards and clicks Done
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.salvage]);
                context.player2.clickDone();

                // Now choose a second unit to receive +2/+2; cannot select the first unit (Pyke)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                // Choose Battlefield Marine as the second target
                context.player1.clickCard(context.battlefieldMarine);

                // Verify second buff applied
                expect(context.battlefieldMarine.getPower()).toBe(marineBasePower + 2);
                expect(context.battlefieldMarine.remainingHp).toBe(marineBaseHP + 2);

                // Ensure enemy unit unchanged
                expect(context.wampa.getPower()).toBe(wampaBasePower);
                expect(context.wampa.remainingHp).toBe(wampaBaseHP);

                context.moveToNextActionPhase();

                // verify all buffs are finished
                expect(context.pykeSentinel.getPower()).toBe(pykeBasePower);
                expect(context.pykeSentinel.remainingHp).toBe(pykeBaseHP);
                expect(context.battlefieldMarine.getPower()).toBe(marineBasePower);
                expect(context.battlefieldMarine.remainingHp).toBe(marineBaseHP);
                expect(context.wampa.getPower()).toBe(wampaBasePower);
                expect(context.wampa.remainingHp).toBe(wampaBaseHP);
            });

            it('allows passing on disclose, only the first unit gets +2/+2', function () {
                const { context } = contextRef;

                const marineBasePower = context.battlefieldMarine.getPower();
                const marineBaseHP = context.battlefieldMarine.remainingHp;
                const pykeBasePower = context.pykeSentinel.getPower();
                const pykeBaseHP = context.pykeSentinel.remainingHp;

                // Play event and select Battlefield Marine as the first unit
                context.player1.clickCard(context.withThunderousApplause);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine, context.wampa
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                // First buff applied
                expect(context.battlefieldMarine.getPower()).toBe(marineBasePower + 2);
                expect(context.battlefieldMarine.remainingHp).toBe(marineBaseHP + 2);

                // Disclose appears; choose to pass (Choose nothing)
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                // No further buffs; Pyke remains unchanged
                expect(context.pykeSentinel.getPower()).toBe(pykeBasePower);
                expect(context.pykeSentinel.remainingHp).toBe(pykeBaseHP);
            });
        });
    });
});
