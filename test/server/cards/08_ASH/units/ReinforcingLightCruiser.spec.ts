describe('Reinforcing Light Cruiser', function () {
    integration(function (contextRef) {
        describe('its When Played ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reinforcing-light-cruiser'],
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should exhaust a friendly unit when played', function () {
                const { context } = contextRef;

                // Play the cruiser
                context.player1.clickCard(context.reinforcingLightCruiser);

                expect(context.player1).toHavePrompt('Exhaust a unit');

                // All units in play are valid targets, including the cruiser itself
                expect(context.player1).toBeAbleToSelectExactly([
                    context.reinforcingLightCruiser,
                    context.wampa,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.tielnFighter
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Select a friendly unit; it is exhausted
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy unit when played', function () {
                const { context } = contextRef;

                // Play the cruiser
                context.player1.clickCard(context.reinforcingLightCruiser);

                expect(context.player1).toHavePrompt('Exhaust a unit');

                // All units in play are valid targets, including the cruiser itself
                expect(context.player1).toBeAbleToSelectExactly([
                    context.reinforcingLightCruiser,
                    context.wampa,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.tielnFighter
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Select an enemy unit; it is exhausted
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline and exhaust no units', function () {
                const { context } = contextRef;

                // Play the cruiser and pass the optional ability
                context.player1.clickCard(context.reinforcingLightCruiser);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // No units exhausted beyond the cruiser itself
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.tielnFighter.exhausted).toBeFalse();
                expect(context.reinforcingLightCruiser.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
