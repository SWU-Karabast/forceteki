describe('I Am Your Father', function() {
    integration(function(contextRef) {
        describe('I Am Your Father\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                context.player1.clickCard(context.iAmYourFather);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.darthVader]); // can target only opponent's units, including leaders
                context.player1.clickCard(context.darthVader);

                expect(context.player2).toHaveEnabledPromptButtons(['Darth Vader takes 7 damage', 'Opponent draws 3 cards']);
                context.player2.clickPrompt('Darth Vader takes 7 damage');
                expect(context.darthVader.damage).toEqual(7);
            });

            it('draws the player who played it 3 cards when their opponent selects that', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.iAmYourFather);
                context.player1.clickCard(context.darthVader);

                context.player2.clickPrompt('Opponent draws 3 cards');
                expect(context.darthVader.damage).toEqual(0);
                expect(context.player1.hand.length).toEqual(3);
                expect(context.player2.hand.length).toEqual(0);
            });
        });

        describe('I Am Your Father\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                context.player1.clickCard(context.iAmYourFather);
                expect(context.iAmYourFather).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
