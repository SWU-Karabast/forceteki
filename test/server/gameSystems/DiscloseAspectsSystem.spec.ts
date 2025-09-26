describe('The Disclose aspects mechanic', function() {
    integration(function(contextRef) {
        // TODO: It is currently possible to reveal more cards than necessary to satisfy the aspects
        //       For example, if we need [Command, Command, Heroism], we could select C-3PO (Heroism)
        //       first, then Battlefield Marine (Command, Heroism) to add a Command aspect, and then
        //       Salvage (Command) to satisfy the final aspect requirement. However, now C-3PO is
        //       redundant since the Heroism aspect is already satisfied by Battlefield Marine.
        //
        //       We don't currently have the comprehensive rules for the Disclose mechanic, so we may
        //       need to revisit this later if this sequence turns out to be illegal. A fix would probably
        //       involve adding some deselection logic to the card selector.

        it('allows a player to perform an effect if the required aspects are disclosed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvage', 'battlefield-marine'],
                    groundArena: ['mina-bonteri#stop-this-war']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Player 2 plays Vanquish to defeat Mina Bonteri
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.minaBonteri);

            // Prompt to disclose required aspects to draw a card
            expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
            expect(context.player1).toBeAbleToSelectExactly([
                context.salvage,
                context.battlefieldMarine
            ]);

            // Player can choose not to disclose anything
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');

            // Choose which cards to reveal
            context.player1.clickCard(context.salvage);
            expect(context.player1).toHaveDisabledPromptButton('Done'); // Not all required aspects represented yet
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHaveEnabledPromptButton('Done'); // All required aspects represented
            context.player1.clickPrompt('Done');

            // Cards are revealed to the opponent
            expect(context.player2).toHaveExactViewableDisplayPromptCards([
                context.salvage,
                context.battlefieldMarine
            ]);
            expect(context.player2).toHaveEnabledPromptButton('Done');
            context.player2.clickDone();

            // Player 1 draws a card
            expect(context.player1.hand.length).toBe(3);
        });

        it('is automatically skipped if the required aspects cannot be disclosed with cards in hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['restock', 'cartel-spacer', 'reinforcement-walker', 'consular-security-force'],
                    groundArena: ['mina-bonteri#stop-this-war']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Player 2 plays Vanquish to defeat Mina Bonteri
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.minaBonteri);

            expect(context.player1).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(4); // No card drawn
        });

        it('cards with a non-required aspect can be revealed if they also contain a required aspect', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [
                        'superlaser-technician', // Command | Villainy
                        'salvage',               // Command
                        'karabast',              // Aggression | Heroism
                        'restock'                // Neutral
                    ],
                    groundArena: ['mina-bonteri#stop-this-war']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Player 2 plays Vanquish to defeat Mina Bonteri
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.minaBonteri);

            // Prompt to disclose required aspects to draw a card
            expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
            expect(context.player1).toBeAbleToSelectExactly([
                context.superlaserTechnician,
                context.salvage,
                context.karabast
                // Restock is not selectable because it has no aspects
            ]);

            // Choose which cards to reveal
            context.player1.clickCard(context.superlaserTechnician);
            expect(context.player1).toHaveDisabledPromptButton('Done'); // Not all required aspects represented yet
            context.player1.clickCard(context.karabast);
            expect(context.player1).toHaveDisabledPromptButton('Done'); // Not all required aspects represented yet
            context.player1.clickCard(context.salvage);
            expect(context.player1).toHaveEnabledPromptButton('Done'); // All required aspects represented
            context.player1.clickPrompt('Done');

            // Cards are revealed to the opponent
            expect(context.player2).toHaveExactViewableDisplayPromptCards([
                context.superlaserTechnician,
                context.salvage,
                context.karabast
            ]);
            expect(context.player2).toHaveEnabledPromptButton('Done');
            context.player2.clickDone();

            // Player 1 draws a card
            expect(context.player1.hand.length).toBe(5);
        });

        it('updates the selectable cards as aspects are satisfied', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [
                        'salvage',              // Command
                        'battlefield-marine',   // Command | Heroism
                        'cartel-spacer',        // Cunning | Villainy
                        'command',              // Command | Command
                        'c3po#protocol-droid',  // Heroism
                        'restock',              // Neutral
                        'karabast',             // Aggression | Heroism
                    ],
                    groundArena: ['mina-bonteri#stop-this-war']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Player 2 plays Vanquish to defeat Mina Bonteri
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.minaBonteri);

            // Prompt to disclose required aspects to draw a card
            expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
            expect(context.player1).toBeAbleToSelectExactly([
                context.salvage,
                context.battlefieldMarine,
                context.command,
                context.c3poProtocolDroid,
                context.karabast
                // Restock and Cartel Spacer are not selectable because they have no required aspects
            ]);

            // Select Command (Command, Command)
            context.player1.clickCard(context.command);
            expect(context.player1).toHaveDisabledPromptButton('Done'); // Not all required aspects represented yet

            // Only cards with Heroism aspect can be selected now
            expect(context.player1).toBeAbleToSelectExactly([
                context.command, // Selectable for deselection
                context.battlefieldMarine,
                context.c3poProtocolDroid,
                context.karabast
            ]);

            // Select C3PO (Heroism)
            context.player1.clickCard(context.c3poProtocolDroid);
            expect(context.player1).toHaveEnabledPromptButton('Done'); // All required aspects represented

            // Only selected cards can be deselected now
            expect(context.player1).toBeAbleToSelectExactly([
                context.command,
                context.c3poProtocolDroid
            ]);

            context.player1.clickPrompt('Done');

            // Cards are revealed to the opponent
            expect(context.player2).toHaveExactViewableDisplayPromptCards([
                context.command,
                context.c3poProtocolDroid
            ]);
            expect(context.player2).toHaveEnabledPromptButton('Done');
            context.player2.clickDone();

            // Player 1 draws a card
            expect(context.player1.hand.length).toBe(8);
        });

        it('allows the player to choose nothing even if they can satisfy the requirements', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salvage', 'battlefield-marine'],
                    groundArena: ['mina-bonteri#stop-this-war']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Player 2 plays Vanquish to defeat Mina Bonteri
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.minaBonteri);

            // Prompt to disclose required aspects to draw a card
            expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
            expect(context.player1).toBeAbleToSelectExactly([
                context.salvage,
                context.battlefieldMarine
            ]);

            // Player can choose not to disclose anything
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickPrompt('Choose nothing');

            // Player 1 does not draw a card
            expect(context.player1).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(2);
        });

        it('is automatically skipped if the required aspects cannot be disclosed with cards in hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: ['mina-bonteri#stop-this-war']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Player 2 plays Vanquish to defeat Mina Bonteri
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.minaBonteri);

            expect(context.player1).toBeActivePlayer();
            expect(context.player1.hand.length).toBe(0); // No card drawn
        });
    });
});