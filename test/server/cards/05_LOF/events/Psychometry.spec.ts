describe('Psychometry', function() {
    integration(function(contextRef) {
        describe('Psychometry\'s ability', function() {
            it('should do nothing if it is the only card in discard', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.psychometry);
                expect(context.psychometry).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should choose a card, even if there is an empty deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        discard: ['force-throw'],
                        deck: []
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.psychometry);
                expect(context.player1).toBeAbleToSelectExactly([context.forceThrow]);
                context.player1.clickCard(context.forceThrow);

                expect(context.psychometry).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to draw any card that shares a trait with the chosen card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        discard: ['yoda#old-master'],
                        deck: ['mystic-reflection', 'krayt-dragon', 'wampa', 'jedi-light-cruiser', 'moisture-farmer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.psychometry);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.mysticReflection, context.jediLightCruiser],
                    invalid: [context.wampa, context.moistureFarmer, context.kraytDragon]
                });
                context.player1.clickCardInDisplayCardPrompt(context.jediLightCruiser);

                expect(context.getChatLogs(2)).toContain('player1 takes Jedi Light Cruiser');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose nothing for the search', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        discard: ['yoda#old-master'],
                        deck: ['mystic-reflection', 'krayt-dragon', 'wampa', 'jedi-light-cruiser', 'moisture-farmer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.psychometry);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.mysticReflection, context.jediLightCruiser],
                    invalid: [context.wampa, context.moistureFarmer, context.kraytDragon]
                });

                context.player1.clickPrompt('Take Nothing');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose a card that lost a Trait before being discarded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        groundArena: [{ card: 'yoda#old-master', damage: 1 }],
                        deck: ['mystic-reflection', 'krayt-dragon', 'wampa', 'jedi-light-cruiser', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: ['nameless-terror']
                    }
                });
                const { context } = contextRef;

                // Take away Yoda's Force trait and defeat him
                context.player1.passAction();
                context.player2.clickCard(context.namelessTerror);
                context.player2.clickCard(context.yoda);

                context.player1.clickDone();

                context.player1.clickCard(context.psychometry);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.mysticReflection, context.jediLightCruiser],
                    invalid: [context.wampa, context.moistureFarmer, context.kraytDragon]
                });

                context.player1.clickCardInDisplayCardPrompt(context.mysticReflection);
                expect(context.mysticReflection).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
