describe('I Am Your Father', function() {
    integration(function() {
        describe('I Am Your Father\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['i-am-your-father'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('does 7 damage to the target unit when the opponent selects that', function () {
                this.player1.clickCard(this.iAmYourFather);
                expect(this.player1).toBeAbleToSelectExactly([this.viperProbeDroid, this.darthVader]); //can target only opponent's units, including leaders
                this.player1.clickCard(this.darthVader);

                expect(this.player2).toHaveEnabledPromptButtons(['Darth Vader takes 7 damage', 'Opponent draws 3 cards']);
                this.player2.clickPrompt('Darth Vader takes 7 damage');
                expect(this.darthVader.damage).toEqual(7);
            });

            it('draws the player who played it 3 cards when their opponent selects that', function () {
                this.player1.clickCard(this.iAmYourFather);
                this.player1.clickCard(this.darthVader);

                this.player2.clickPrompt('Opponent draws 3 cards');
                expect(this.darthVader.damage).toEqual(0);
                expect(this.player1.hand.length).toEqual(3);
                expect(this.player2.hand.length).toEqual(0);
            });
        });

        describe('I Am Your Father\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['i-am-your-father'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                    }
                });
            });

            it('does not resolve with no target, but card is still played', function () {
                this.player1.clickCard(this.iAmYourFather);
                expect(this.iAmYourFather).toBeInLocation('discard');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
