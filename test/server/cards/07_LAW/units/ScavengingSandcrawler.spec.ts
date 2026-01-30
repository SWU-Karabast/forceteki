describe('Scavenging Sandcrawler', function () {
    integration(function (contextRef) {
        describe('Scavenging Sandcrawler\'s On Attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['scavenging-sandcrawler'],
                        discard: ['battlefield-marine', 'wampa', 'takedown'],
                        deck: ['superlaser-technician']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                        discard: ['resupply']
                    }
                });
            });

            it('should allow putting a card from discard pile on bottom of deck to create a Credit token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scavengingSandcrawler);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Option to use the ability (it's a trigger prompt, so we select the card from discard pile directly)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.takedown]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 1);

                expect(context.player1.credits).toBe(1);
            });

            it('should do nothing if the ability is passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scavengingSandcrawler);
                context.player1.clickCard(context.deathStarStormtrooper);

                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');

                expect(context.player1.credits).toBe(0);
            });
        });
    });
});
