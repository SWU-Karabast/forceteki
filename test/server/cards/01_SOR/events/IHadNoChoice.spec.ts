describe('I Had No Choice', function() {
    integration(function(contextRef) {
        describe('I Had No Choice\'s ability', function() {
            describe('when there are two or more non-leader units in play', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['i-had-no-choice'],
                            deck: ['atst', 'atst', 'atst', 'atst', 'atst'],
                            groundArena: [{ card: 'wampa', upgrades: ['experience', 'resilient'] }, 'warzone-lieutenant'],
                        },
                        player2: {
                            groundArena: ['viper-probe-droid'],
                            leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                        }
                    });
                });

                it('returns the unit chose by the opponent to its owner hand and put the other ones at the bottom of the deck', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.iHadNoChoice);
                    expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.warzoneLieutenant, context.viperProbeDroid]);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.viperProbeDroid);
                    context.player1.clickPrompt('Done');

                    expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.viperProbeDroid]);
                    context.player2.clickCard(context.viperProbeDroid);

                    expect(context.viperProbeDroid).toBeInZone('hand', context.player2);
                    expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
                    expect(context.resilient).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });

                it('can choose nothing', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.iHadNoChoice);
                    expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.warzoneLieutenant, context.viperProbeDroid]);
                    context.player1.clickPrompt('Choose nothing');

                    expect(context.viperProbeDroid).toBeInZone('groundArena', context.player2);
                    expect(context.wampa).toBeInZone('groundArena', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there is only one non-leader unit in play', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['i-had-no-choice'],
                            deck: ['atst', 'atst', 'atst', 'atst', 'atst'],
                            groundArena: [{ card: 'wampa', upgrades: ['experience', 'resilient'] }],
                        },
                        player2: {
                            groundArena: [],
                            leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                        },

                        // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                        autoSingleTarget: true
                    });
                });

                it('returns the unit to its owner hand', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.iHadNoChoice);

                    // can choose no targets
                    context.player1.clickPrompt('Choose up to 2 non-leader units. An opponent chooses 1 of those units. Return that unit to its owner’s hand and put the other on the bottom of its owner’s deck. -> Wampa');

                    expect(context.wampa).toBeInZone('hand', context.player1);
                    expect(context.resilient).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there are no non-leader units in play', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['i-had-no-choice'],
                            deck: ['atst', 'atst', 'atst', 'atst', 'atst'],
                            groundArena: [],
                        },
                        player2: {
                            groundArena: [],
                            leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                        }
                    });
                });

                it('does nothing', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.iHadNoChoice);
                    context.player1.clickPrompt('Play anyway');

                    expect(context.iHadNoChoice).toBeInZone('discard', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
