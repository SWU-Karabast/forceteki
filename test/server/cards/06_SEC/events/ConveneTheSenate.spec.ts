describe('Convene the Senate', function () {
    integration(function (contextRef) {
        it('should create a Spy token and let you reveal up to 2 Official units from the top 8 to draw them', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['convene-the-senate'],
                    deck: [
                        // top of deck, mix of Officials and non-Officials
                        'wartime-trade-official', // Official
                        'battlefield-marine',
                        'high-command-councilor', // Official
                        'pyke-sentinel',
                        'echo-base-defender',
                        'cantina-braggart',
                        'ardent-sympathizer',
                        'cell-block-guard',
                        'swoop-racer'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.conveneTheSenate);

            // Deck search prompt for up to 2 cards
            expect(context.player1).toHavePrompt('Select up to 2 cards to reveal');
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wartimeTradeOfficial, context.highCommandCouncilor],
                invalid: [
                    context.battlefieldMarine,
                    context.pykeSentinel,
                    context.echoBaseDefender,
                    context.cantinaBraggart,
                    context.ardentSympathizer,
                    context.cellBlockGuard
                ]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            // Pick 2 Official units
            context.player1.clickCardInDisplayCardPrompt(context.wartimeTradeOfficial);
            context.player1.clickCardInDisplayCardPrompt(context.highCommandCouncilor);
            context.player1.clickDone();

            // Both chosen cards are drawn
            expect(context.wartimeTradeOfficial).toBeInZone('hand');
            expect(context.highCommandCouncilor).toBeInZone('hand');

            expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 6);
            expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 6);
            expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 6);
            expect(context.cantinaBraggart).toBeInBottomOfDeck(context.player1, 6);
            expect(context.ardentSympathizer).toBeInBottomOfDeck(context.player1, 6);
            expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 6);

            // A Spy token should be created for player1, in the ground arena and exhausted
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();
        });
    });
});
