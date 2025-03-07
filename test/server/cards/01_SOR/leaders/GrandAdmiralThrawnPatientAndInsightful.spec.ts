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

            it('should look at top card of each player\'s deck', function () {
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

        describe('Grand Admiral Thrawn\'s undeployed ability, when one deck is empty,', function () {
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
                        deck: []
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickPrompt('Done');
                        }
                    }
                });
            });

            it('should look at top deck of the non-empty deck', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                // thrawn ability reveal top deck of controller since opponent deck is empty (happens at beginning of action phase)
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    { card: context.rivalsFall, displayText: 'Yourself' }
                ]);

                // confirm that there is no chat message for the cards
                expect(context.getChatLogs(1)[0]).not.toContain(context.rivalsFall.title);
                context.player1.clickPrompt('Done');

                expect(context.player1).toBeActivePlayer();
            });

            it('should reveal top deck of the non-empty deck to exhaust a unit which cost same or less than the revealed card', function () {
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

            it('should do nothing when revealing top card of player\'s empty deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck']);
                context.player1.clickPrompt('Reveal the top card of the opponent\'s deck');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Grand Admiral Thrawn\'s undeployed ability, when both decks are empty,', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['desperado-freighter'],
                        leader: 'grand-admiral-thrawn#patient-and-insightful',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        deck: []
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickPrompt('Done');
                        }
                    }
                });
            });

            it('should show nothing at start of action phase', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                expect(context.player1).not.toHavePrompt('Look at the top card of each player\'s deck');
            });

            it('should do nothing when revealing top card of player\'s empty deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Grand Admiral Thrawn\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['takedown', 'vanquish', 'rivals-fall'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['desperado-freighter'],
                        leader: { card: 'grand-admiral-thrawn#patient-and-insightful', deployed: true },
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

            it('should look at top card of each player\'s deck', function () {
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

            it('should be able to pass the on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck', 'Pass']);
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('should reveal top deck of the controller to exhaust a unit which cost same or less than the revealed card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck', 'Pass']);
                context.player1.clickPrompt('Reveal the top card of your deck');

                expect(context.getChatLogs(1)[0]).toContain(context.takedown.title);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should reveal top deck of the opponent to exhaust a unit which cost same or less than the revealed card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck', 'Pass']);
                context.player1.clickPrompt('Reveal the top card of the opponent\'s deck');

                expect(context.getChatLogs(1)[0]).toContain(context.steadfastBattalion.title);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.desperadoFreighter]);
                context.player1.clickCard(context.desperadoFreighter);

                expect(context.desperadoFreighter.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Grand Admiral Thrawn\'s deployed ability, when one player\'s deck is empty,', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['takedown', 'vanquish', 'rivals-fall'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['desperado-freighter'],
                        leader: { card: 'grand-admiral-thrawn#patient-and-insightful', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        deck: []
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickPrompt('Done');
                        }
                    }
                });
            });

            it('should look at top deck of the non-empty deck', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                // thrawn ability reveal top deck of controller since opponent deck is empty (happens at beginning of action phase)
                expect(context.player1).toHaveExactViewableDisplayPromptCards([
                    { card: context.rivalsFall, displayText: 'Yourself' }
                ]);

                // confirm that there is no chat message for the cards
                expect(context.getChatLogs(1)[0]).not.toContain(context.rivalsFall.title);
                context.player1.clickPrompt('Done');

                expect(context.player1).toBeActivePlayer();
            });

            it('should reveal top deck of the non-empty deck to exhaust a unit which cost same or less than the revealed card', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck', 'Pass']);
                context.player1.clickPrompt('Reveal the top card of your deck');

                expect(context.getChatLogs(1)[0]).toContain(context.takedown.title);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when revealing top card of player\'s empty deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal the top card of your deck', 'Reveal the top card of the opponent\'s deck', 'Pass']);
                context.player1.clickPrompt('Reveal the top card of the opponent\'s deck');

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Grand Admiral Thrawn\'s deployed ability, when both decks are empty,', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['desperado-freighter'],
                        leader: { card: 'grand-admiral-thrawn#patient-and-insightful', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        deck: []
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickPrompt('Done');
                        }
                    }
                });
            });

            it('should show nothing at start of action phase', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                expect(context.player1).not.toHavePrompt('Look at the top card of each player\'s deck');
            });

            it('should do nothing when revealing top card of player\'s empty deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
