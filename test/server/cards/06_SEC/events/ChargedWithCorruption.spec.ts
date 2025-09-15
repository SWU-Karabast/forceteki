describe('Charged With Corruption', function () {
    integration(function (contextRef) {
        describe('Charged With Corruption\'s ability', function () {
            it('should, after disclosing Command, Command, have a friendly unit capture an enemy non-leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-corruption', 'superlaser-technician', 'salvage'], // Superlaser Technician (Command|Villainy), Salvage (Command)
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                // Play the event, disclose [Command, Command]
                context.player1.clickCard(context.chargedWithCorruption);
                // Disclose by selecting Superlaser Technician (Command|Villainy) and Salvage (Command)
                context.player1.clickCard(context.superlaserTechnician);
                context.player1.clickCard(context.salvage);
                context.player1.clickPrompt('Done');
                // Opponent sees the disclosed cards
                context.player2.clickDone();

                // Choose the friendly unit that will capture
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // Choose an enemy non-leader unit to be captured
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // The enemy unit should now be captured by the chosen friendly unit
                expect(context.battlefieldMarine).toBeCapturedBy(context.wampa);
            });

            it('should not proceed if the player declines to disclose the required aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['charged-with-corruption', 'superlaser-technician', 'salvage'], // can satisfy but choose nothing
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.chargedWithCorruption);
                // Decline to disclose even though it's possible
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickPrompt('Choose nothing');

                // Event is played, but no capture occurs and the enemy unit remains in the arena
                expect(context.chargedWithCorruption.zoneName).toBe('discard');
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
