describe('Scavenging Sandcrawler', function () {
    integration(function (contextRef) {
        describe('Scavenging Sandcrawler\'s On Attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['scavenging-sandcrawler'],
                        discard: ['battlefield-marine', 'wampa'],
                        deck: ['superlaser-technician']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });
            });

            it('should allow putting a card from discard pile on bottom of deck to create a Credit token', async function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scavengingSandcrawler);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Option to use the ability (it's a trigger prompt, so we select the card from discard pile directly)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('deck');
                expect(context.player1.deck[context.player1.deck.length - 1]).toBe(context.battlefieldMarine);
                
                // Check if credit token is created
                expect(context.player1.credits).toBe(1);
            });

            it('should do nothing if the ability is passed', async function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scavengingSandcrawler);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Option to use the ability
                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                
                expect(context.player1.credits).toBe(0);
            });
        });
    });
});
