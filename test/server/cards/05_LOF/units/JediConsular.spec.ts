describe('Jedi Consular', function() {
    integration(function(contextRef) {
        describe('Jedi Consular\'s activated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        groundArena: ['jedi-consular'],
                        base: 'echo-base',
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['waylay', 'consortium-starviper', 'jawa-scavenger', 'swoop-racer']
                    },
                });
            });

            it('should allow the controller to play a unit with a discount of 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jediConsular);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Play a unit from your hand. It costs 2 less']);

                context.player1.clickPrompt('Play a unit from your hand. It costs 2 less');
                expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.jawaScavenger, context.swoopRacer]);

                context.player1.clickCard(context.swoopRacer);
                expect(context.jediConsular.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // Cost discount from Jedi Consular should be gone
                context.player1.clickCard(context.jawaScavenger);
                expect(context.jawaScavenger).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();
                context.readyCard(context.jediConsular);
                context.player1.setHasTheForce(true);

                // Should be able to select and play a unit that costs exactly 2 more than ready resources
                context.player1.setResourceCount(1);
                context.player1.clickCard(context.jediConsular);
                context.player1.clickPrompt('Play a unit from your hand. It costs 2 less');
                expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.consortiumStarviper);
                expect(context.consortiumStarviper).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give the next unit played by the controller a discount after the controller declines to play a unit with the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jediConsular);
                context.player1.clickPrompt('Play a unit from your hand. It costs 2 less');
                context.player1.clickPrompt('Choose nothing');
                expect(context.jediConsular.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                context.player2.passAction();

                context.player1.clickCard(context.swoopRacer);
                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('cannot be used without having the force', function() {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.jediConsular);
                expect(context.player1).not.toHaveEnabledPromptButtons(['Attack', 'Play a unit from your hand. It costs 2 less']);

                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not be able to play a unit as a Pilot for a discount', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    groundArena: ['jedi-consular'],
                    leader: 'fennec-shand#honoring-the-deal',
                    hand: ['han-solo#has-his-moments'],
                    spaceArena: ['cartel-turncoat']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.jediConsular);
            context.player1.clickPrompt('Play a unit from your hand. It costs 2 less');
            context.player1.clickCard(context.hanSolo);

            expect(context.jediConsular.exhausted).toBeTrue();
            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.hanSolo).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
