describe('New Tactics', () => {
    integration(function (contextRef) {
        describe('New Tactics\' ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['new-tactics'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('allows player to choose an enemy non-leader unit and put it on top of their deck', () => {
                const { context } = contextRef;

                context.player1.clickCard(context.newTactics);

                // Choose a unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.wampa);

                // Player 2 should be prompted to choose top or bottom of deck
                expect(context.player2).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player2.clickPrompt('Top');

                // Verify Wampa is on top of player2's deck
                expect(context.player2.deck[0]).toBe(context.wampa);
            });

            it('allows player to choose an enemy non-leader unit and put it on bottom of their deck', () => {
                const { context } = contextRef;

                context.player1.clickCard(context.newTactics);

                // Choose a unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Player 2 should be prompted to choose top or bottom of deck
                expect(context.player2).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player2.clickPrompt('Bottom');

                // Verify A-Wing is on top of player2's deck
                expect(context.greenSquadronAwing).toBeInBottomOfDeck(context.player2, 1);
            });

            it('allows player to choose a friendly non-leader unit and put it on bottom of their deck', () => {
                const { context } = contextRef;

                context.player1.clickCard(context.newTactics);

                // Choose a unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);

                // Player 1 should be prompted to choose top or bottom of deck
                expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player1.clickPrompt('Bottom');

                // Verify Wampa is on top of player2's deck
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 1);
            });
        });

        it('New Tactics\' ability, when targeting a stolen unit, will prompt the owner to choose top or bottom of their deck', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['new-tactics'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', owner: 'player1' }, 'battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.newTactics);

            // Choose a unit
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            // Player 1 should be prompted to choose top or bottom of deck since they are the owner of Wampa
            expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
            context.player1.clickPrompt('Bottom');

            // Verify Wampa is on bottom of player1's deck
            expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
        });
    });
});