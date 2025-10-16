describe('First Light Threatening Elegance', function() {
    integration(function(contextRef) {
        describe('First Light\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['first-light#threatening-elegance'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom', 'the-purrgil-king#leading-the-journey']
                    }
                });
            });

            it('should trigger and draw a card when First Light defeats a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLightThreateningElegance);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.lurkingTiePhantom);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hand.length).toBe(1);
            });

            it('should not trigger if First Light does not defeat a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLightThreateningElegance);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.thePurrgilKingLeadingTheJourney);

                expect(context.player1.hand.length).toBe(0);
            });

            it('should not draw a card if trigger is declined', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLightThreateningElegance);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.lurkingTiePhantom);
                context.player1.clickPrompt('Pass');

                expect(context.player1.hand.length).toBe(0);
            });
        });

        it('First Light should be playable using plot and trigger ambush and ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-moff-tarkin#oversector-governor',
                    resources: ['first-light#threatening-elegance', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                    deck: ['pyke-sentinel', 'wampa'],
                    base: 'echo-base'
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.grandMoffTarkin);
            context.player1.clickPrompt('Deploy Grand Moff Tarkin');

            expect(context.player1).toHavePassAbilityPrompt('Play First Light using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.firstLightThreateningElegance).toBeInZone('spaceArena');
            expect(context.pykeSentinel).toBeInZone('resource');

            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.lurkingTiePhantom);
            context.player1.clickPrompt('Trigger');

            expect(context.player1.hand.length).toBe(1);
        });
    });
});