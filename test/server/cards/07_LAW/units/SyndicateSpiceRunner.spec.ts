describe('Syndicate Spice Runner', function() {
    integration(function(contextRef) {
        it('Syndicate Spice Runner\'s When Played ability should search the top 3 cards for an Underworld unit and draw it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['syndicate-spice-runner'],
                    deck: ['weequay-pirate', 'wampa', 'pyke-sentinel', 'battlefield-marine', 'atst'],
                    base: 'command-center',
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.syndicateSpiceRunner);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.weequayPirate, context.pykeSentinel],
                invalid: [context.wampa]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.weequayPirate);

            expect(context.player2).toBeActivePlayer();
            expect(context.weequayPirate).toBeInZone('hand');
            expect(context.getChatLogs(2)).toContain('player1 takes Weequay Pirate');
            expect([context.wampa, context.pykeSentinel]).toAllBeInBottomOfDeck(context.player1, 2);
        });

        it('Syndicate Spice Runner\'s When Played ability should search the top 3 cards for an Underworld unit even if deck has only 2 cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['syndicate-spice-runner'],
                    deck: ['weequay-pirate', 'wampa'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.syndicateSpiceRunner);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.weequayPirate],
                invalid: [context.wampa]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.weequayPirate);

            expect(context.player2).toBeActivePlayer();
            expect(context.weequayPirate).toBeInZone('hand');
            expect(context.getChatLogs(2)).toContain('player1 takes Weequay Pirate');
            expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);

            expect(context.player2).toBeActivePlayer();
        });

        it('Syndicate Spice Runner\'s When Played ability should not trigger if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['syndicate-spice-runner'],
                    deck: []
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.syndicateSpiceRunner);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
