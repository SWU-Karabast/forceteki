describe('Vigilance', function() {
    integration(function(contextRef) {
        describe('Vigilance\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vigilance'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        deck: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('Discards 6 cards from an opponent\'s deck and give a shield token to a unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.vigilance);
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Discard 6 cards from an opponent\'s deck.',
                    'Defeat a unit with 3 or less remaining HP.',
                    'Give a Shield token to a unit'
                ]);
                context.player1.clickPrompt('Discard 6 cards from an opponent\'s deck.');
                // check state
                expect(context.player2.deck.length).toBe(1);
                expect(context.player2.discard.length).toBe(6);
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Defeat a unit with 3 or less remaining HP.',
                    'Give a Shield token to a unit'
                ]);
                context.player1.clickPrompt('Give a shield token to a unit');
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
