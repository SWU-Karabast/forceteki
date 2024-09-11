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

            it('can only select opponent\'s units, including leaders', function () {
                this.player1.clickCard(this.iAmYourFather);
                expect(this.player1).toBeAbleToSelectExactly([this.viperProbeDroid, this.darthVader]);
            });

            it('gives the opponent a choice after selecting the target unit', function () {
                this.player1.clickCard(this.iAmYourFather);
                this.player1.clickCard(this.darthVader);

                expect(this.player2).toHaveEnabledPromptButtons(['Let Darth Vader take 7 damage', 'Let opponent draw 3 cards']);
            });

            it('does 7 damage to the target unit when the opponent selects that', function () {
                this.player1.clickCard(this.iAmYourFather);
                this.player1.clickCard(this.darthVader);

                this.player2.clickPrompt('Let Darth Vader take 7 damage');
                expect(this.darthVader.damage).toEqual(7);
            });

            it('draws the player who played it 3 cards when their opponent selects that', function () {
                this.player1.clickCard(this.iAmYourFather);
                this.player1.clickCard(this.darthVader);

                this.player2.clickPrompt('Let opponent draw 3 cards');
                expect(this.darthVader.damage).toEqual(0);
                expect(this.player1.hand.length).toEqual(3);
                expect(this.player2.hand.length).toEqual(0);
            });
        });
    });
});
