describe('I Had No Choice', function() {
    integration(function(contextRef) {
        describe('I Had No Choice\'s ability', function() {
            describe('when there are two or more non-leader units in play', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['i-had-no-choice'],
                            deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                            groundArena: ['wampa', 'warzone-lieutenant'],
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

                    expect(context.viperProbeDroid).toBeInLocation('hand', context.player2);
                    expect(context.wampa).toBeInLocation('deck', context.player1);
                    expect(context.player1.deck[5]).toEqual(context.wampa);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there is only one non-leader units in play', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['i-had-no-choice'],
                            deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                            groundArena: ['wampa'],
                        },
                        player2: {
                            groundArena: [],
                            leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                        }
                    });
                });

                it('returns the unit to its owner hand', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.iHadNoChoice);

                    expect(context.wampa).toBeInLocation('hand', context.player1);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there are no non-leader units in play', function() {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['i-had-no-choice'],
                            deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
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

                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
