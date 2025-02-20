
describe('Padme Amidala, Serving the Republic', function () {
    integration(function (contextRef) {
        describe('Padme Amidala\'s undeployed ability', function () {
            it('should search the top 3 cards for a Republic card, reveal it, and draw it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#serving-the-republic',
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        deck: ['headhunter-squadron', 'confiscate', 'heroes-on-both-sides', 'viper-probe-droid'],
                        resources: 3
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Player 1 uses Padme's ability to search for a Republic card
                context.player1.clickCard(context.padmeAmidala);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.confiscate],
                    selectable: [context.headhunterSquadron, context.heroesOnBothSides]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.headhunterSquadron);
                expect(context.getChatLogs(2)).toContain('player1 takes Headhunter Squadron');
                expect(context.headhunterSquadron).toBeInZone('hand');

                expect([
                    context.heroesOnBothSides,
                    context.confiscate,
                ]).toAllBeInBottomOfDeck(context.player1, 2);

                // Player 2 defeats the Battlefield Marine and Padme loses the Coordinate ability
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                // Move to the next turn
                context.moveToNextActionPhase();

                // Player 1 cannot use Padme's ability to search for a Republic card
                context.player1.clickCardNonChecking(context.padmeAmidala);

                expect(context.player1).toBeActivePlayer();
            });

            it('should do nothing when the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#serving-the-republic',
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        deck: [],
                        resources: 3
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                expect(context.player1.deck.length).toBe(0);

                // Player 1 uses Padme's ability with no effect
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickPrompt('Take nothing');

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Padme Amidala\'s deployed ability', function () {
            it('should search the top 3 cards for a Republic card, reveal it, and draw it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#serving-the-republic', deployed: true },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        deck: ['confiscate', 'heroes-on-both-sides', 'viper-probe-droid']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Player 1 uses Padme's ability to search for a Republic card
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Search the top 3 cards of your deck for a Republic card, reveal it, and draw it');
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.confiscate, context.viperProbeDroid],
                    selectable: [context.heroesOnBothSides]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.heroesOnBothSides);
                expect(context.getChatLogs(2)).toContain('player1 takes Heroes on Both Sides');
                expect(context.heroesOnBothSides).toBeInZone('hand');

                expect([
                    context.viperProbeDroid,
                    context.confiscate,
                ]).toAllBeInBottomOfDeck(context.player1, 2);

                // Player 2 defeats the Battlefield Marine and Padme loses the Coordinate ability
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                // Move to the next turn
                context.moveToNextActionPhase();

                // Player 1 cannot use Padme's ability to search for a Republic card
                context.player1.clickCard(context.padmeAmidala);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
