describe('Grand Admiral Thrawn, Patient and Insightful', function () {
    integration(function (contextRef) {
        describe('Grand Admiral Thrawn\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['takedown', 'vanquish', 'rivals-fall', 'cartel-spacer'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['desperado-freighter'],
                        leader: 'grand-admiral-thrawn#patient-and-insightful',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        deck: ['steadfast-battalion', 'avenger#hunting-star-destroyer', 'specforce-soldier']
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickPrompt('Done');
                        }
                    }
                });
            });

            it('should look at top deck of each player', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                // thrawn ability reveal top deck of each player (happens at beginning of action phase)
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    { card: context.rivalsFall, displayText: 'Yourself' },
                    { card: context.specforceSoldier, displayText: 'Opponent' }
                ]);

                // confirm that there is no chat message for the cards
                expect(context.getChatLogs(1)[0]).not.toContain(context.rivalsFall.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.specforceSoldier.title);
                context.player1.clickPrompt('Done');

                expect(context.player1).toBeActivePlayer();
            });

            it('should reveal top deck of the controller to exhaust a unit which cost same or less than the revealed card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck']);
                context.player1.clickPrompt('Reveal the top card of your deck');

                expect(context.getChatLogs(1)[0]).toContain(context.takedown.title);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should reveal top deck of the opponent to exhaust a unit which cost same or less than the revealed card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck']);
                context.player1.clickPrompt('Reveal the top card of the opponent\'s deck');

                expect(context.getChatLogs(1)[0]).toContain(context.steadfastBattalion.title);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.desperadoFreighter]);
                context.player1.clickCard(context.desperadoFreighter);

                expect(context.desperadoFreighter.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Grand Admiral Thrawn\'s deployed ability', function () {
            it('should look at top deck of each player and on attack ability should reveal top deck of a player to exhaust a unit which cost same or less than the revealed card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['takedown', 'vanquish', 'rivals-fall'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'grand-admiral-thrawn#patient-and-insightful', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: ['atst', 'avenger#hunting-star-destroyer', 'specforce-soldier']
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickPrompt('Done');
                        }
                    }
                });

                const { context } = contextRef;

                context.moveToNextActionPhase();

                // thrawn ability reveal top deck of each player (happens at beginning of action phase)
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    { card: context.rivalsFall, displayText: 'Yourself' },
                    { card: context.specforceSoldier, displayText: 'Opponent' }
                ]);

                // confirm that there is no chat message for the cards
                expect(context.getChatLogs(1)[0]).not.toContain(context.rivalsFall.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.specforceSoldier.title);
                context.player1.clickPrompt('Done');

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck']);
                context.player1.clickPrompt('Reveal the top card of your deck');

                // confirm optional ability
                expect(context.player1).toHavePassAbilityPrompt('Reveal the top card of any player\'s deck');
                context.player1.clickPrompt('Reveal the top card of any player\'s deck');

                expect(context.getChatLogs(1, true)).toContain('player1 reveals Rival\'s Fall due to Grand Admiral Thrawn');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.grandAdmiralThrawn]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeTrue();
            });
        });
    });
});
