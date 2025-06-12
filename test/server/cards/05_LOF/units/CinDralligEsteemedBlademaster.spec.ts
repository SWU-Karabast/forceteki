describe('Cin Drallig, Esteemed Blademaster', function() {
    integration(function(contextRef) {
        describe('Cin Drallig\'s when played ability', function() {
            it('can play a Lightsaber from hand for free and attach it to him, then ready him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kit-fisto#focused-jedi-master',
                        groundArena: [
                            {
                                card: 'anakin-skywalker#maverick-mentor',
                                exhausted: true
                            }
                        ],
                        hand: [
                            'cin-drallig#esteemed-blademaster',
                            'infiltrators-skill',
                            'force-throw',
                            'fallen-lightsaber',
                            'green-squadron-awing'
                        ],
                        resources: 8
                    },
                    player2: {
                        groundArena: ['fifth-brother#fear-hunter']
                    }
                });

                const { context } = contextRef;

                // Play Cin Drallig, exhausting all resources
                context.player1.clickCard(context.cinDrallig);
                expect(context.cinDrallig.exhausted).toBeTrue();
                expect(context.player1.readyResourceCount).toBe(0);

                // Only the Lightsaber upgrade should be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.fallenLightsaber]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickCard(context.fallenLightsaber);

                // It should only be playable on Cin Drallig
                expect(context.player1).toBeAbleToSelectExactly([context.cinDrallig]);
                context.player1.clickCard(context.cinDrallig);

                // Fallen Lightsaber is attached to Cin Drallig, and he is readied
                expect(context.cinDrallig).toHaveExactUpgradeNames(['fallen-lightsaber']);
                expect(context.cinDrallig.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });

            it('allows the player to choose not to play a Lightsaber from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kit-fisto#focused-jedi-master',
                        hand: [
                            'cin-drallig#esteemed-blademaster',
                            'fallen-lightsaber',
                        ],
                        resources: 8
                    }
                });

                const { context } = contextRef;

                // Play Cin Drallig
                context.player1.clickCard(context.cinDrallig);

                // Ability is triggered
                expect(context.player1).toBeAbleToSelectExactly([context.fallenLightsaber]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');

                // Choose not to play the Lightsaber
                context.player1.clickPrompt('Choose nothing');

                expect(context.cinDrallig.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('has no effect if no Lightsaber is in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kit-fisto#focused-jedi-master',
                        hand: [
                            'cin-drallig#esteemed-blademaster',
                            'infiltrators-skill',
                            'force-throw',
                            'green-squadron-awing'
                        ],
                        resources: 8
                    }
                });

                const { context } = contextRef;

                // Play Cin Drallig
                context.player1.clickCard(context.cinDrallig);

                // Ability is not triggered
                expect(context.player2).toBeActivePlayer();
                expect(context.cinDrallig.exhausted).toBeTrue();
            });
        });
    });
});
