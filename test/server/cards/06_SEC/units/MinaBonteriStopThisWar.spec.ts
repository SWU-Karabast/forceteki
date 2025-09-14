describe('Mina Bonteri, Stop This War', function() {
    integration(function(contextRef) {
        describe('Mina Bonteri\'s when defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasInitiative: true,
                        hand: [
                            'salvage',              // Command
                            'battlefield-marine',   // Command | Heroism
                            'cartel-spacer',        // Cunning | Villainy
                            'command',              // Command | Command
                            'c3po#protocol-droid',  // Heroism
                            'restock',              // Neutral
                            'karabast',             // Aggression | Heroism
                        ],
                        groundArena: [
                            'mina-bonteri#stop-this-war'
                        ],
                        discard: [
                            'cartel-spacer'
                        ]
                    },
                    player2: {
                        hasInitiative: false,
                        hand: [
                            'pillage',
                            'no-glory-only-results',
                            'resupply',
                            'echo-base-defender'
                        ],
                        groundArena: [
                            'reinforcement-walker'
                        ]
                    }
                });
            });

            it('allows the player to draw a card if they disclose cards with all required aspects', function() {
                const { context } = contextRef;
                const startingHandSize = context.player1.hand.length;

                // Attack Reinforcement Walker with Mina Bonteri to defeat her
                context.player1.clickCard(context.minaBonteri);
                context.player1.clickCard(context.reinforcementWalker);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.salvage,
                    context.battlefieldMarine,
                    context.command,
                    context.c3poProtocolDroid,
                    context.karabast
                ]);

                // Player can choose not to disclose anything
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');

                // Choose which cards to disclose
                context.player1.clickCard(context.command);
                expect(context.player1).toHaveDisabledPromptButton('Done'); // Not all required aspects represented yet
                context.player1.clickCard(context.c3poProtocolDroid);
                expect(context.player1).toHaveEnabledPromptButton('Done'); // All required aspects represented
                context.player1.clickPrompt('Done');

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([
                    context.command,
                    context.c3poProtocolDroid
                ]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Player 1 draws a card
                expect(context.player1.hand.length).toBe(startingHandSize + 1);
            });

            it('the player may disclose extra aspects as long as all required aspects are represented', function() {
                const { context } = contextRef;
                const startingHandSize = context.player1.hand.length;


                // Attack Reinforcement Walker with Mina Bonteri to defeat her
                context.player1.clickCard(context.minaBonteri);
                context.player1.clickCard(context.reinforcementWalker);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.salvage,
                    context.battlefieldMarine,
                    context.command,
                    context.c3poProtocolDroid,
                    context.karabast
                ]);

                // Choose which cards to disclose
                context.player1.clickCard(context.karabast); // Unnecessary Aggression aspect
                context.player1.clickCard(context.command);
                expect(context.player1).toHaveEnabledPromptButton('Done'); // All required aspects represented
                context.player1.clickPrompt('Done');

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([
                    context.karabast,
                    context.command
                ]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Player 1 draws a card
                expect(context.player1.hand.length).toBe(startingHandSize + 1);
            });

            it('skips the ability prompt if the cards in hand cannot satisfy the required aspects', function() {
                const { context } = contextRef;
                const startingHandSize = context.player1.hand.length;

                context.player1.passAction();
                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent discards');

                // Player 1 discards Battlefield Marine and Command
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.command);
                context.player1.clickPrompt('Done');

                // Attack Reinforcement Walker with Mina Bonteri to defeat her
                context.player1.clickCard(context.minaBonteri);
                context.player1.clickCard(context.reinforcementWalker);

                // No ability prompt because cards in hand cannot satisfy required aspects
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(startingHandSize - 2); // 2 cards discarded, no cards drawn
            });

            it('can be used by the opponent if they play No Glory, Only Results', function() {
                const { context } = contextRef;
                const startingHandSize = context.player2.hand.length;

                context.player1.passAction();

                // Player 2 plays No Glory, Only Results on Mina Bonteri
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.minaBonteri);

                // Prompt to disclose required aspects
                expect(context.player2).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
                expect(context.player2).toBeAbleToSelectExactly([
                    context.resupply,
                    context.echoBaseDefender
                ]);

                // Choose which cards to disclose
                context.player2.clickCard(context.resupply);
                expect(context.player2).toHaveDisabledPromptButton('Done'); // Not all required aspects represented yet
                context.player2.clickCard(context.echoBaseDefender);
                expect(context.player2).toHaveEnabledPromptButton('Done'); // All required aspects represented
                context.player2.clickPrompt('Done');

                // Cards are revealed to the opponent
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    context.resupply,
                    context.echoBaseDefender
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                // Player 2 draws a card
                expect(context.player2.hand.length).toBe(startingHandSize); // 1 card played, 1 card drawn
            });

            it('allows the player to choose not to disclose anything', function() {
                const { context } = contextRef;
                const startingHandSize = context.player1.hand.length;

                // Attack Reinforcement Walker with Mina Bonteri to defeat her
                context.player1.clickCard(context.minaBonteri);
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');

                context.player1.clickPrompt('Choose nothing');
                expect(context.player1.hand.length).toBe(startingHandSize); // No cards drawn
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});