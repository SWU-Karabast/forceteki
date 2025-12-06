describe('The Galleon, Marauding Pirate Ship', function() {
    integration(function(contextRef) {
        it('The Galleon\'s when played ability should disclose Aggression, Aggression, Villainy to create 3 Spy tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-galleon#marauding-pirate-ship', 'aggression', 'cartel-spacer']
                },
            });

            const { context } = contextRef;

            // Play The Galleon
            context.player1.clickCard(context.theGalleon);

            // Disclose prompt should appear; select the double-Aggression card and a Villainy card
            // We won't assert exact prompt text to avoid brittle spacing issues
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.aggression);
            context.player1.clickCard(context.cartelSpacer);
            context.player1.clickDone();

            // Opponent confirms viewing the disclosed cards
            context.player2.clickDone();

            // 3 Spy tokens should be created for player1, in ground, and exhausted
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(3);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });
    });
});
