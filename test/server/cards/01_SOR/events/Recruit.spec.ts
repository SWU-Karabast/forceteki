describe('Recruit', function () {
    integration(function (contextRef) {
        describe('Recruit\'s ability - ', function () {
            describe('when there is one valid option,', function () {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: ['viper-probe-droid', 'confiscate', 'i-am-your-father', 'surprise-strike', 'vanquish', 'cell-block-guard', 'tie-advanced'],
                        },
                    });
                });

                it('should prompt to choose a unit from the top 5 cards, reveal it, draw it, and move the rest to the bottom of the deck', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.recruit);
                    expect(context.player1).toHavePrompt('Select a card to reveal');
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        selectable: [context.viperProbeDroid],
                        invalid: [context.confiscate, context.iAmYourFather, context.surpriseStrike, context.vanquish]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                    context.player1.clickCardInDisplayCardPrompt(context.viperProbeDroid);
                    expect(context.getChatLogs(2)).toContain('player1 takes Viper Probe Droid');
                    expect(context.viperProbeDroid).toBeInZone('hand');

                    expect(context.confiscate).toBeInBottomOfDeck(context.player1, 4);
                    expect(context.iAmYourFather).toBeInBottomOfDeck(context.player1, 4);
                    expect(context.surpriseStrike).toBeInBottomOfDeck(context.player1, 4);
                    expect(context.vanquish).toBeInBottomOfDeck(context.player1, 4);
                });

                it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.recruit);
                    context.player1.clickPrompt('Take nothing');

                    expect([context.viperProbeDroid, context.confiscate, context.iAmYourFather, context.surpriseStrike, context.vanquish]).toAllBeInBottomOfDeck(context.player1, 5);
                });

                it('should allow selection when deck has less than five cards', function() {
                    const { context } = contextRef;

                    context.player1.setDeck([context.viperProbeDroid, context.confiscate, context.iAmYourFather]);
                    context.player1.clickCard(context.recruit);

                    expect(context.player1).toHaveExactDisplayPromptCards({
                        selectable: [context.viperProbeDroid],
                        invalid: [context.confiscate, context.iAmYourFather]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                    context.player1.clickCardInDisplayCardPrompt(context.viperProbeDroid);
                    expect(context.player1.deck.length).toBe(2);
                    expect([context.confiscate, context.iAmYourFather]).toAllBeInBottomOfDeck(context.player1, 2);
                });
            });

            describe('when the deck is empty,', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: [],
                        },
                    });
                });

                it('should have no valid options to choose from', function() {
                    const { context } = contextRef;

                    expect(context.player1.deck.length).toBe(0);

                    context.player1.clickCard(context.recruit);
                    context.player1.clickPrompt('Play anyway');
                    expect(context.recruit).toBeInZone('discard');
                    expect(context.player1.deck.length).toBe(0);

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there are no valid options,', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: ['disarm', 'confiscate', 'i-am-your-father', 'surprise-strike', 'vanquish', 'cell-block-guard', 'tie-advanced'],
                        },
                    });
                });

                it('should have no valid options to choose from', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.recruit);
                    expect(context.player1).toHavePrompt('Select a card to reveal');
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        invalid: [context.disarm, context.confiscate, context.iAmYourFather, context.surpriseStrike, context.vanquish]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                    context.player1.clickPrompt('Take nothing');

                    expect([context.disarm, context.confiscate, context.iAmYourFather, context.surpriseStrike, context.vanquish]).toAllBeInBottomOfDeck(context.player1, 5);
                });
            });


            describe('when there are multiple valid options,', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: ['viper-probe-droid', 'confiscate', 'i-am-your-father', 'surprise-strike', 'cell-block-guard', 'vanquish', 'tie-advanced'],
                        },
                    });
                });

                it('should have multiple valid options to choose from', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.recruit);
                    expect(context.player1).toHavePrompt('Select a card to reveal');
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        selectable: [context.viperProbeDroid, context.cellBlockGuard],
                        invalid: [context.confiscate, context.iAmYourFather, context.surpriseStrike]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                    context.player1.clickCardInDisplayCardPrompt(context.cellBlockGuard);
                    expect(context.getChatLogs(2)).toContain('player1 takes Cell Block Guard');
                    expect(context.cellBlockGuard).toBeInZone('hand');

                    expect(context.viperProbeDroid).toBeInBottomOfDeck(context.player1, 4);
                    expect(context.confiscate).toBeInBottomOfDeck(context.player1, 4);
                    expect(context.iAmYourFather).toBeInBottomOfDeck(context.player1, 4);
                    expect(context.surpriseStrike).toBeInBottomOfDeck(context.player1, 4);
                });
            });
        });
    });
});
