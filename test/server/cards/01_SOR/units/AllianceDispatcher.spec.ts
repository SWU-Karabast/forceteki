describe('Alliance Dispatcher', function() {
    integration(function(contextRef) {
        describe('Alliance Dispatcher\'s activated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['alliance-dispatcher'],
                        base: 'echo-base',
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['waylay', 'consortium-starviper', 'jawa-scavenger', 'swoop-racer']
                    },
                });
            });

            it('should allow the controller to play a unit with a discount of 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceDispatcher);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Play a unit from your hand. It costs 1 less']);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
                expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper, context.jawaScavenger, context.swoopRacer]);
                context.player1.clickCard(context.jawaScavenger);
                expect(context.allianceDispatcher.exhausted).toBe(true);
                expect(context.jawaScavenger).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // cost discount from Dispatcher should be gone
                context.player1.clickCard(context.swoopRacer);
                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();
                context.readyCard(context.allianceDispatcher);

                // should be able to select and play a unit that costs exactly 1 more than ready resources
                context.player1.setResourceCount(2);
                context.player1.clickCard(context.allianceDispatcher);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
                expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.consortiumStarviper).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give the next unit played by the controller a discount after the controller declines to play a unit with the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.allianceDispatcher);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
                context.player1.clickPrompt('Choose nothing');
                expect(context.allianceDispatcher.exhausted).toBe(true);

                context.player2.passAction();

                context.player1.clickCard(context.swoopRacer);
                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });

        it('should not be able to play a unit as a Pilot for a discount', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['alliance-dispatcher'],
                    leader: 'fennec-shand#honoring-the-deal',
                    hand: ['han-solo#has-his-moments'],
                    spaceArena: ['cartel-turncoat']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.allianceDispatcher);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 less');
            context.player1.clickCard(context.hanSolo);
            expect(context.allianceDispatcher.exhausted).toBe(true);
            expect(context.hanSolo).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
