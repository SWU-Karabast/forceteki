describe('Commission', function () {
    integration(function (contextRef) {
        describe('Commission\'s ability - ', function () {
            describe('when there is one or more valid option,', function () {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['commission'],
                            deck: ['viper-probe-droid', 'confiscate', 'i-am-your-father', 'surprise-strike', 'cell-block-guard', 'tie-advanced', 'frontline-shuttle', 'electrostaff', 'greedo#slow-on-the-draw', 'mandalorian-armor', 'vanquish'],
                        },
                    });
                });

                it('should prompt to choose a unit from the top 10 cards, reveal it, draw it, and move the rest to the bottom of the deck', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.commission);
                    expect(context.player1).toHavePrompt('Select a card to reveal');
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        invalid: [context.viperProbeDroid, context.confiscate, context.iAmYourFather, context.surpriseStrike, context.cellBlockGuard, context.tieAdvanced],
                        selectable: [context.frontlineShuttle, context.electrostaff, context.greedo, context.mandalorianArmor]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                    context.player1.clickCardInDisplayCardPrompt(context.electrostaff);
                    expect(context.getChatLogs(2)).toContain('player1 takes Electrostaff');
                    expect(context.electrostaff).toBeInZone('hand');

                    expect(context.viperProbeDroid).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.confiscate).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.iAmYourFather).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.surpriseStrike).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.tieAdvanced).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.frontlineShuttle).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.greedo).toBeInBottomOfDeck(context.player1, 9);
                    expect(context.mandalorianArmor).toBeInBottomOfDeck(context.player1, 9);
                });

                it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.commission);
                    context.player1.clickPrompt('Take nothing');

                    expect([
                        context.viperProbeDroid,
                        context.confiscate,
                        context.iAmYourFather,
                        context.surpriseStrike,
                        context.cellBlockGuard,
                        context.tieAdvanced,
                        context.frontlineShuttle,
                        context.greedo,
                        context.mandalorianArmor,
                        context.electrostaff
                    ]).toAllBeInBottomOfDeck(context.player1, 10);
                });

                it('should allow selection when deck has less than five cards', function() {
                    const { context } = contextRef;

                    context.player1.setDeck([context.mandalorianArmor, context.confiscate, context.iAmYourFather]);
                    context.player1.clickCard(context.commission);
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        selectable: [context.mandalorianArmor],
                        invalid: [context.confiscate, context.iAmYourFather]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                    context.player1.clickCardInDisplayCardPrompt(context.mandalorianArmor);

                    expect(context.player1.deck.length).toBe(2);
                    expect([context.confiscate, context.iAmYourFather]).toAllBeInBottomOfDeck(context.player1, 2);
                });
            });

            describe('when the deck is empty,', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['commission'],
                            deck: [],
                        },
                    });
                });

                it('should have no valid options to choose from', function() {
                    const { context } = contextRef;

                    expect(context.player1.deck.length).toBe(0);

                    context.player1.clickCard(context.commission);
                    expect(context.commission).toBeInZone('discard');
                    expect(context.player1.deck.length).toBe(0);

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there are no valid options,', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['commission'],
                            deck: ['disarm', 'confiscate', 'i-am-your-father', 'surprise-strike', 'vanquish', 'cell-block-guard', 'tie-advanced', 'battlefield-marine', 'green-squadron-awing', 'pyke-sentinel'],
                        },
                    });
                });

                it('should have no valid options to choose from', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.commission);
                    expect(context.player1).toHavePrompt('Select a card to reveal');
                    expect(context.player1).toHaveExactDisplayPromptCards({
                        invalid: [
                            context.disarm,
                            context.confiscate,
                            context.iAmYourFather,
                            context.surpriseStrike,
                            context.vanquish,
                            context.cellBlockGuard,
                            context.tieAdvanced,
                            context.battlefieldMarine,
                            context.greenSquadronAwing,
                            context.pykeSentinel
                        ]
                    });
                    expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                    context.player1.clickPrompt('Take nothing');

                    expect([context.disarm, context.confiscate, context.iAmYourFather, context.surpriseStrike, context.vanquish, context.cellBlockGuard, context.tieAdvanced, context.battlefieldMarine, context.greenSquadronAwing, context.pykeSentinel]).toAllBeInBottomOfDeck(context.player1, 10);
                });
            });
        });
    });
});
