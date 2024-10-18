describe('C-3PO, Protocol Droid', function() {
    integration(function(contextRef) {
        describe('C-3PO\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#protocol-droid'],
                        deck: ['wampa', 'battlefield-marine', 'atst', 'atst'],
                    }
                });
            });

            it('should prompt to choose a Rebel from the top 5 cards, reveal it, draw it, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                // CASE 1: threepio is played, we guess the number right
                context.player1.clickCard(context.c3po);

                // should have prompt options from 0 to 20
                expect(context.player1).toHaveExactListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('4');

                // TODO: we need a 'look at' prompt for secretly revealing, currently chat logs go to all players
                expect(context.getChatLogs(1)).toContain('C-3PO sees Wampa');
                expect(context.player1).toHavePassAbilityPrompt('Reveal and draw Wampa from the top of your deck');

                context.player1.clickPrompt('Reveal and draw Wampa from the top of your deck');
                expect(context.getChatLogs(1)).toContain('player1 reveals Wampa due to C-3PO');
                expect(context.wampa).toBeInLocation('hand');

                // CASE 2: threepio attacks, we guess the number wrong
                context.c3po.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.c3po);

                expect(context.player1).toHaveExactListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('0');

                expect(context.getChatLogs(1)).toContain('C-3PO sees Battlefield Marine');
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInLocation('deck');
            });
        });

        describe('C-3PO\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#protocol-droid'],
                        deck: [],
                    }
                });
            });

            it('should do nothing if the player\'s deck is empty', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
