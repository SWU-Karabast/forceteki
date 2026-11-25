import { OpponentMulliganChoice } from '../../../../../server/game/core/gameSteps/PromptInterfaces';

describe('Setup phase, the player with the initiative choosing first in the mulligan', function() {
    integration(function(contextRef) {
        const mulliganPromptText = 'Choose whether to mulligan or keep your hand';
        const waitingOnMulliganText = 'Waiting for opponent to choose whether to mulligan';
        const resourcePromptText = 'Select 2 cards to resource';

        const decks = {
            player1: { deck: ['moisture-farmer', 'wampa', 'pyke-sentinel', 'lothal-insurgent', 'battlefield-marine', 'confiscate', 'restock', 'surprise-strike', 'atst', 'atst'] },
            player2: { deck: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'wampa', 'wampa'] },
        };

        describe('when player1 has the initiative', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({ phase: 'setup', ...decks });

                const { context } = contextRef;
                context.selectInitiativePlayer(context.player1);
            });

            describe('in the mulligan', function() {
                it('shows player2 what player1 has chosen, and shows player1 nothing about player2', function() {
                    const { context } = contextRef;

                    expect(context.player2).toHavePrompt(mulliganPromptText);
                    expect(context.player2.currentPrompt().opponentMulliganChoice).toBe(OpponentMulliganChoice.NotChosen);
                    expect(context.player2.currentPrompt().promptDescription).toBe('Your opponent has not chosen yet');
                    expect(context.player1).toHavePrompt(mulliganPromptText);
                    expect(context.player1.currentPrompt().opponentMulliganChoice).toBeUndefined();

                    context.player1.clickPrompt('Mulligan');

                    expect(context.player1).toHavePrompt(waitingOnMulliganText);
                    expect(context.player1).toHaveExactPromptButtons([]);
                    expect(context.player2.currentPrompt().opponentMulliganChoice).toBe(OpponentMulliganChoice.Mulligan);
                    expect(context.player2.currentPrompt().promptDescription).toBe('Your opponent has taken a mulligan');

                    context.player2.clickPrompt('Keep');
                    expect(context.player1).toHavePrompt(resourcePromptText);
                });

                it('shows player2 that player1 kept their hand', function() {
                    const { context } = contextRef;

                    context.player1.clickPrompt('Keep');

                    expect(context.player2.currentPrompt().opponentMulliganChoice).toBe(OpponentMulliganChoice.Keep);
                    expect(context.player2.currentPrompt().promptDescription).toBe('Your opponent has kept their hand');

                    context.player2.clickPrompt('Keep');
                });

                it('lets player2 choose first and wait, without player1 being shown anything, even in the chat', function() {
                    const { context } = contextRef;
                    const messagesBefore = context.game.messages.length;

                    context.player2.clickPrompt('Mulligan');

                    expect(context.player2).toHavePrompt(waitingOnMulliganText);
                    expect(context.player2).toHaveExactPromptButtons(['Cancel', 'Waiting']);
                    expect(context.player2.currentButtons).toEqual(['Cancel', 'Waiting']);
                    expect(context.player2).toHaveDisabledPromptButton('Waiting');
                    expect(context.player1).toHavePrompt(mulliganPromptText);
                    expect(context.player1.currentPrompt().opponentMulliganChoice).toBeUndefined();
                    expect(context.game.messages.length).toBe(messagesBefore);

                    context.player1.clickPrompt('Keep');

                    // both choices are announced once both have chosen, player1's first
                    expect(context.getChatLogs(4)).toEqual([
                        'player1 will keep their hand',
                        'player2 will mulligan',
                        'player2 is shuffling their deck',
                        'player2 draws 6 cards in their starting hand',
                    ]);
                });

                it('lets player2 cancel a choice made first and choose differently', function() {
                    const { context } = contextRef;
                    const handBefore = [...context.player2.hand];

                    context.player2.clickPrompt('Mulligan');
                    context.player2.clickPrompt('Cancel');

                    expect(context.player2).toHavePrompt(mulliganPromptText);
                    expect(context.player2).toHaveExactPromptButtons(['Mulligan', 'Keep']);
                    expect(context.player2.currentPrompt().opponentMulliganChoice).toBe(OpponentMulliganChoice.NotChosen);
                    expect(context.player1).toHavePrompt(mulliganPromptText);

                    context.player1.clickPrompt('Mulligan');
                    expect(context.player2.currentPrompt().opponentMulliganChoice).toBe(OpponentMulliganChoice.Mulligan);

                    // the earlier Mulligan was taken back, so Keep keeps the hand
                    context.player2.clickPrompt('Keep');
                    expect(context.player2.hand).toEqual(handBefore);
                    expect(context.getChatLogs(10)).toContain('player2 will keep their hand');
                    expect(context.getChatLogs(10)).not.toContain('player2 will mulligan');
                });
            });

            // the rules give the setup's resource step no order, so neither player chooses first there
            it('has both players choose their resources at once, neither shown anything about the other', function() {
                const { context } = contextRef;
                context.player1.clickPrompt('Keep');
                context.player2.clickPrompt('Keep');

                for (const player of [context.player1, context.player2]) {
                    expect(player).toHavePrompt(resourcePromptText);
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

                expect(context.player1.resources.length).toBe(2);
                expect(context.player2.resources.length).toBe(2);
            });

            it('shows player2 the usual waiting prompt, without Cancel, when player2 resources first', function() {
                const { context } = contextRef;
                context.player1.clickPrompt('Keep');
                context.player2.clickPrompt('Keep');

                context.player2.clickCard(context.player2.hand[0]);
                context.player2.clickCard(context.player2.hand[1]);
                context.player2.clickDone();

                expect(context.player2).toHavePrompt('Waiting for opponent to choose cards to resource');
                expect(context.player2).toHaveExactPromptButtons([]);

                context.player1.clickCard(context.player1.hand[0]);
                context.player1.clickCard(context.player1.hand[1]);
                context.player1.clickDone();
            });
        });

        describe('when player1 has the initiative and cannot mulligan', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'setup',
                    player1: { base: 'nabat-village', deck: decks.player1.deck },
                    player2: decks.player2,
                });

                const { context } = contextRef;
                context.selectInitiativePlayer(context.player1);
            });

            it('shows player2 that player1 kept their hand', function() {
                const { context } = contextRef;

                expect(context.player1).toHavePrompt(waitingOnMulliganText);
                expect(context.player2.currentPrompt().opponentMulliganChoice).toBe(OpponentMulliganChoice.Keep);

                context.player2.clickPrompt('Keep');
            });
        });

        describe('when player2 has the initiative and player1 cannot mulligan', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'setup',
                    player1: { base: 'nabat-village', deck: decks.player1.deck },
                    player2: decks.player2,
                });

                const { context } = contextRef;
                context.selectInitiativePlayer(context.player2);
            });

            it('shows player1 a waiting prompt without a Cancel button, since their choice was made for them', function() {
                const { context } = contextRef;

                expect(context.player1).toHavePrompt(waitingOnMulliganText);
                expect(context.player1.currentButtons).toEqual(['Waiting']);
                expect(context.player2.currentPrompt().opponentMulliganChoice).toBeUndefined();

                context.player2.clickPrompt('Keep');
                expect(context.player1).toHavePrompt(resourcePromptText);
            });
        });
    });
});
