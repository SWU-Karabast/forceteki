describe('Qui-Gon Jinn, The Negotiations Will Be Short', () => {
    integration(function (contextRef) {
        describe('Qui-Gon Jinn\'s when defeated ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['quigon-jinn#the-negotiations-will-be-short', 'battlefield-marine'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing'],
                        hasInitiative: true,
                    }
                });
            });

            it('allows player to choose a non-leader ground unit and put it on top of their deck', () => {
                const { context } = contextRef;

                // Defeat Qui-Gon Jinn with Rival's Fall
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.quigonJinn);

                // Choose a unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                // Player 2 should be prompted to choose top or bottom of deck
                expect(context.player2).toHaveExactPromptButtons(['Move Wampa to top of your deck', 'Move Wampa to bottom of your deck']);
                context.player2.clickPrompt('Move Wampa to top of your deck');

                // Verify Wampa is on top of player2's deck
                expect(context.player2.deck[0]).toBe(context.wampa);
            });

            it('allows player to choose a non-leader ground unit and put it on bottom of their deck', () => {
                const { context } = contextRef;

                // Defeat Qui-Gon Jinn with Rival's Fall
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.quigonJinn);

                // Choose a unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.wampa);

                // Player 2 should be prompted to choose top or bottom of deck
                expect(context.player2).toHaveExactPromptButtons(['Move Wampa to top of your deck', 'Move Wampa to bottom of your deck']);
                context.player2.clickPrompt('Move Wampa to bottom of your deck');

                // Verify Wampa is on top of player2's deck
                expect(context.wampa).toBeInBottomOfDeck(context.player2, 1);
            });

            it('allows player to choose a non-leader ground unit and put it on bottom of their deck', () => {
                const { context } = contextRef;

                // Defeat Qui-Gon Jinn with Rival's Fall
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.quigonJinn);

                // Choose a unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                // Player 1 should be prompted to choose top or bottom of deck
                expect(context.player1).toHaveExactPromptButtons(['Move Battlefield Marine to top of your deck', 'Move Battlefield Marine to bottom of your deck']);
                context.player1.clickPrompt('Move Battlefield Marine to bottom of your deck');

                // Verify Wampa is on top of player2's deck
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 1);
            });
        });

        it('Qui-Gon Jinn\'s when defeated ability with No Glory Only Results allows player1 to choose a non-leader ground unit and player2 puts it on bottom of their deck', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                },
                player2: {
                    groundArena: ['quigon-jinn#the-negotiations-will-be-short', 'wampa'],
                }
            });
            const { context } = contextRef;

            // Player 1 plays No Glory, Only Results
            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.quigonJinn);

            // Choose a unit
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // Player 2 should be prompted to choose top or bottom of deck
            expect(context.player2).toHaveExactPromptButtons(['Move Wampa to top of your deck', 'Move Wampa to bottom of your deck']);
            context.player2.clickPrompt('Move Wampa to bottom of your deck');

            // Verify Wampa is on top of player2's deck
            expect(context.wampa).toBeInBottomOfDeck(context.player2, 1);
        });
    });
});