describe('Subjugating Starfighter', function() {
    integration(function(contextRef) {
        describe('Subjugating Starfighter\'s abilities', function() {
            it('Should create a Battle Droid token if the player has the initiative', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['subjugating-starfighter'],
                        hasInitiative: true
                    },
                    player2: {
                        spaceArena: ['hwk290-freighter']
                    }
                });

                const { context } = contextRef;

                // Allow the test to end with an open prompt.
                context.allowTestToEndWithOpenPrompt = true;

                // Play the card.
                context.player1.clickCard(context.subjugatingStarfighter);

                // Check if the Battle Droid token was created if the player has initiative.'
                context.player1.clickPrompt('Create a Battle Droid token.');
                expect(context.player1.findCardsByName('battle-droid').length).toBe(1);
                expect(context.player1.findCardsByName('battle-droid')).toAllBeInZone('groundArena', context.player1);
                expect(context.player1.findCardsByName('battle-droid').every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });

            it('Should NOT create a Battle Droid token if the player DOES NOT has the initiative', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['subjugating-starfighter']
                    },
                    player2: {
                        spaceArena: ['hwk290-freighter'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Allow the test to end with an open prompt.
                context.allowTestToEndWithOpenPrompt = true;

                // Have player 2 claim initiative
                context.player2.claimInitiative();

                // Play the card.
                context.player1.clickCard(context.subjugatingStarfighter);

                // Check that the Battle Droid token was not created.
                expect(context.player1.findCardsByName('battle-droid').length).toBe(0);
            });
        });
    });
});
