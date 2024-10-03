describe('Recruit', function () {
    integration(function () {
        describe('Recruit\'s ability - ', function () {
            describe('when there is one valid option,', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: ['viper-probe-droid', 'confiscate', 'i-am-your-father', 'surprise-strike', 'vanquish', 'cell-block-guard', 'tie-advanced'],
                        },
                    });
                });

                it('should prompt to choose a unit from the top 5 cards, reveal it, draw it, and move the rest to the bottom of the deck', function() {
                    this.player1.clickCard(this.recruit);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    expect(this.player1).toHaveDisabledPromptButtons([this.confiscate.title, this.iAmYourFather.title, this.surpriseStrike.title, this.vanquish.title]);
                    expect(this.player1).toHaveEnabledPromptButtons([this.viperProbeDroid.title, 'Take nothing']);

                    this.player1.clickPrompt(this.viperProbeDroid.title);
                    expect(this.getChatLogs(2)).toContain('player1 takes Viper Probe Droid');
                    expect(this.viperProbeDroid).toBeInLocation('hand');

                    expect(this.confiscate).toBeInBottomOfDeck(this.player1, 4);
                    expect(this.iAmYourFather).toBeInBottomOfDeck(this.player1, 4);
                    expect(this.surpriseStrike).toBeInBottomOfDeck(this.player1, 4);
                    expect(this.vanquish).toBeInBottomOfDeck(this.player1, 4);
                });

                it('should be allowed to choose nothing and place all cards on the bottom of the deck', function () {
                    this.player1.clickCard(this.recruit);
                    this.player1.clickPrompt('Take nothing');

                    expect([this.viperProbeDroid, this.confiscate, this.iAmYourFather, this.surpriseStrike, this.vanquish]).toAllBeInBottomOfDeck(this.player1, 5);
                });

                it('should allow selection when deck has less than five cards', function() {
                    this.player1.setDeck([this.viperProbeDroid, this.confiscate, this.iAmYourFather]);
                    this.player1.clickCard(this.recruit);
                    expect(this.player1).toHaveEnabledPromptButtons([this.viperProbeDroid.title, 'Take nothing']);
                    expect(this.player1).toHaveDisabledPromptButtons([this.confiscate.title, this.iAmYourFather.title]);
                    this.player1.clickPrompt(this.viperProbeDroid.title);

                    expect(this.player1.deck.length).toBe(2);
                    expect([this.confiscate, this.iAmYourFather]).toAllBeInBottomOfDeck(this.player1, 2);
                });


                it('when the deck is empty', function() {
                    this.player1.setDeck([]);
                    expect(this.player1.deck.length).toBe(0);

                    this.player1.clickCard(this.recruit);
                    expect(this.recruit).toBeInLocation('discard');
                    expect(this.player1.deck.length).toBe(0);

                    expect(this.player2).toBeActivePlayer();
                });
            });

            describe('no valid options', function() {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: ['disarm', 'confiscate', 'i-am-your-father', 'surprise-strike', 'vanquish', 'cell-block-guard', 'tie-advanced'],
                        },
                    });
                });

                it('should have no valid options to choose from', function() {
                    this.player1.clickCard(this.recruit);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    expect(this.player1).toHaveDisabledPromptButtons([this.disarm.title, this.confiscate.title, this.iAmYourFather.title, this.surpriseStrike.title, this.vanquish.title]);
                    expect(this.player1).toHaveEnabledPromptButton('Take nothing');

                    this.player1.clickPrompt('Take nothing');

                    expect([this.disarm, this.confiscate, this.iAmYourFather, this.surpriseStrike, this.vanquish]).toAllBeInBottomOfDeck(this.player1, 5);
                });
            });

            describe('multiple valid options', function() {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['recruit'],
                            deck: ['viper-probe-droid', 'confiscate', 'i-am-your-father', 'surprise-strike', 'cell-block-guard', 'vanquish', 'tie-advanced'],
                        },
                    });
                });

                it('should have multiple valid options to choose from', function() {
                    this.player1.clickCard(this.recruit);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    expect(this.player1).toHaveDisabledPromptButtons([this.confiscate.title, this.iAmYourFather.title, this.surpriseStrike.title]);
                    expect(this.player1).toHaveEnabledPromptButtons([this.viperProbeDroid.title, this.cellBlockGuard.title, 'Take nothing']);

                    this.player1.clickPrompt(this.cellBlockGuard.title);
                    expect(this.getChatLogs(2)).toContain('player1 takes Cell Block Guard');
                    expect(this.cellBlockGuard).toBeInLocation('hand');

                    expect(this.viperProbeDroid).toBeInBottomOfDeck(this.player1, 4);
                    expect(this.confiscate).toBeInBottomOfDeck(this.player1, 4);
                    expect(this.iAmYourFather).toBeInBottomOfDeck(this.player1, 4);
                    expect(this.surpriseStrike).toBeInBottomOfDeck(this.player1, 4);
                });
            });
        });
    });
});
