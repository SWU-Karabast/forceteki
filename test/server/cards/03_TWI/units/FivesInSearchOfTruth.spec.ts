describe('Fives, In Search of Truth', function() {
    integration(function(contextRef) {
        it('Fives\' ability should put a clone unit from own discard to bottom of deck to draw one card ', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['fives#in-search-of-truth'],
                    discard: ['wrecker#boom', 'echo#restored', 'green-squadron-awing'],
                    hand: ['resupply']
                },
                player2: {
                    hand: ['rallying-cry'],
                    discard: ['wolffe#suspicious-veteran']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resupply);

            // we played an event, fives ability trigger, we can choose a clone unit
            expect(context.player1).toBeAbleToSelectExactly([context.echo, context.wrecker]);
            expect(context.player1).toHavePassAbilityButton();

            // put echo in bottom of deck and draw one
            context.player1.clickCard(context.echo);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.handSize).toBe(1);
            expect(context.echo).toBeInBottomOfDeck(context.player1, 1);

            // reset
            context.player1.moveCard(context.echo, 'discard');
            context.player1.moveCard(context.resupply, 'hand');

            // an opponent play an event, nothing happen
            context.player2.clickCard(context.rallyingCry);
            expect(context.player1).toBeActivePlayer();

            // play an event and pass, nothing happen
            context.player1.clickCard(context.resupply);
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.handSize).toBe(1);
        });
    });
});
