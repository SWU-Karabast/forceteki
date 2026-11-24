import { OpponentResourceChoice } from '../../../../../server/game/core/gameSteps/PromptInterfaces';

describe('Regroup phase resource step', function() {
    integration(function(contextRef) {
        const resourcePromptText = 'Select between 0 and 1 cards to resource';
        const waitingPromptText = 'Waiting for opponent to choose cards to resource';

        describe('when player1 has the initiative', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        hasInitiative: true,
                    },
                    player2: {
                        hand: ['wampa'],
                    }
                });

                const { context } = contextRef;
                context.moveToRegroupPhase();
            });

            it('shows player2 that player1 has not chosen yet, and shows player1 nothing about player2', function() {
                const { context } = contextRef;

                expect(context.player2).toHavePrompt(resourcePromptText);
                expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.NotChosen);
                expect(context.player2.currentPrompt().promptDescription).toBe('Your opponent has not chosen yet');

                expect(context.player1).toHavePrompt(resourcePromptText);
                expect(context.player1.currentPrompt().opponentResourceChoice).toBeUndefined();
                expect(context.player1.currentPrompt().promptDescription).toBeUndefined();

                // selecting a card is not a choice until it is confirmed
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.NotChosen);

                context.player1.clickDone();
                context.player2.clickDone();
            });

            it('shows player2 that player1 resourced a card once player1 confirms it, and resources both cards only once both players have chosen', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                expect(context.player1).toHavePrompt(waitingPromptText);
                expect(context.player2).toHavePrompt(resourcePromptText);
                expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.Resourced);
                expect(context.player2.currentPrompt().promptDescription).toBe('Your opponent has resourced a card');
                expect(context.battlefieldMarine).toBeInZone('hand');

                context.player2.clickCard(context.wampa);
                context.player2.clickDone();

                expect(context.battlefieldMarine).toBeInZone('resource');
                expect(context.wampa).toBeInZone('resource');
                expect(context.game.currentPhase).toBe('action');
            });

            it('shows player2 that player1 passed resourcing once player1 confirms it', function() {
                const { context } = contextRef;

                context.player1.clickDone();

                expect(context.player2.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.Passed);
                expect(context.player2.currentPrompt().promptDescription).toBe('Your opponent has passed resourcing');

                context.player2.clickDone();

                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.wampa).toBeInZone('hand');
                expect(context.game.currentPhase).toBe('action');
            });

            it('lets player2 choose first, without showing player1 anything', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickDone();

                expect(context.player2).toHavePrompt(waitingPromptText);
                expect(context.player1).toHavePrompt(resourcePromptText);
                expect(context.player1).toHaveExactPromptButtons(['Skip Resourcing']);
                expect(context.player1.currentPrompt().opponentResourceChoice).toBeUndefined();
                expect(context.player1.currentPrompt().promptDescription).toBeUndefined();
                expect(context.wampa).toBeInZone('hand');

                context.player1.clickDone();

                expect(context.wampa).toBeInZone('resource');
                expect(context.game.currentPhase).toBe('action');
            });
        });

        describe('when player2 has the initiative', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;
                context.moveToRegroupPhase();
            });

            it('shows player1 what player2 has chosen, and shows player2 nothing', function() {
                const { context } = contextRef;

                expect(context.player1.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.NotChosen);
                expect(context.player2.currentPrompt().opponentResourceChoice).toBeUndefined();

                context.player2.clickDone();

                expect(context.player1.currentPrompt().opponentResourceChoice).toBe(OpponentResourceChoice.Passed);

                context.player1.clickDone();
            });

            it('resolves player2\'s resourcing before player1\'s', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();
                context.player2.clickCard(context.wampa);
                context.player2.clickDone();

                const chatLogs = context.getChatLogs(10);
                const player2Resourced = chatLogs.indexOf('player2 has resourced 1 card from hand');
                const player1Resourced = chatLogs.indexOf('player1 has resourced 1 card from hand');

                expect(player2Resourced).toBeGreaterThan(-1);
                expect(player1Resourced).toBeGreaterThan(player2Resourced);
            });
        });

        it('does not show the setup phase\'s resource step to either player as a choice made in turn', async function() {
            await contextRef.setupTestAsync({
                phase: 'setup',
            });

            const { context } = contextRef;

            context.selectInitiativePlayer(context.player1);
            context.player1.clickPrompt('Keep');
            context.player2.clickPrompt('Keep');

            for (const player of [context.player1, context.player2]) {
                expect(player).toHavePrompt('Select 2 cards to resource');
                expect(player.currentPrompt().opponentResourceChoice).toBeUndefined();
                expect(player.currentPrompt().promptDescription).toBeUndefined();
            }

            context.player1.clickCard(context.player1.hand[0]);
            context.player1.clickCard(context.player1.hand[1]);
            context.player1.clickDone();

            expect(context.player2.currentPrompt().opponentResourceChoice).toBeUndefined();

            context.player2.clickCard(context.player2.hand[0]);
            context.player2.clickCard(context.player2.hand[1]);
            context.player2.clickDone();
        });
    });
});
