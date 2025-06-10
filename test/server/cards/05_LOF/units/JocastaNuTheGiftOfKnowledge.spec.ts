describe('Jocasta Nu, The Gift of Knowledge', function() {
    integration(function(contextRef) {
        describe('Jocasta Nu\'s When Played ability', function() {
            it('should attach a friendly upgrade on a friendly unit to a different eligible unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jocasta-nu#the-gift-of-knowledge'],
                        groundArena: [{ card: 'yoda#old-master', upgrades: ['yodas-lightsaber'] }],
                        spaceArena: ['graceful-purrgil']
                    },
                    player2: {
                        groundArena: [{ card: 'darth-vader#twilight-of-the-apprentice', upgrades: ['vaders-lightsaber'] }],
                        spaceArena: ['hyperspace-wayfarer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.jocastaNuTheGiftOfKnowledge);

                // assert we can only select the friendly upgrade on a friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.yodasLightsaber]);

                // Give the lightsaber to the space whale
                context.player1.clickCard(context.yodasLightsaber);

                // Make sure yoda is not selectable, but enemies are and so is jocasta as she's just been played
                expect(context.player1).toBeAbleToSelectExactly([context.gracefulPurrgil, context.hyperspaceWayfarer,
                    context.darthVaderTwilightOfTheApprentice, context.jocastaNuTheGiftOfKnowledge]);

                // Attach the lightsaber to the space whale
                context.player1.clickCard(context.gracefulPurrgil);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames(['yodas-lightsaber']);
            });

            it('should not be able to reattach an upgrade unless it is both both friendly and attached to a friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['jocasta-nu#the-gift-of-knowledge', 'liberated-by-darkness'],
                        groundArena: [{ card: 'yoda#old-master', upgrades: ['yodas-lightsaber'] }],
                    },
                    player2: {
                        hasForceToken: true,
                        hand: ['liberated-by-darkness'],
                        groundArena: [{ card: 'darth-vader#twilight-of-the-apprentice', upgrades: ['vaders-lightsaber'] }]
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Liberated by Darkness to take control of Darth Vader
                context.player1.clickCard(context.player1.hand[1]);
                context.player1.clickCard(context.darthVaderTwilightOfTheApprentice);

                // Player 2 plays Liberated by Darkness to take control of Yoda
                context.player2.clickCard(context.player2.hand[0]);
                context.player2.clickCard(context.yodaOldMaster);

                context.player1.clickCard(context.jocastaNuTheGiftOfKnowledge);

                // Darth vader is friendly now, but his upgrade is still controlled by the opponent and is non-friendly
                // Yoda is non-friendly now and his upgrade remains friendly and should also not be selectable
                expect(context.player1).toBeAbleToSelectNoneOf([context.yodasLightsaber, context.vadersLightsaber]);
            });
        });
    });
});
