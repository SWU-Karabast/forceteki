describe('Bib Fortuna', function() {
    integration(function(contextRef) {
        describe('Bib Fortuna\'s activated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bib-fortuna#jabbas-majordomo', 'jawa-scavenger'],
                        hand: ['repair', 'confiscate', 'swoop-racer', 'surprise-strike'],
                        base: { card: 'capital-city', damage: 8 },
                        leader: 'grand-inquisitor#hunting-the-jedi',
                    },
                });
            });

            it('should allow the controller to play an event with a discount of 1', function () {
                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.bibFortuna.exhausted = false;
                    context.player1.moveCard(context.repair, 'hand');
                    context.player1.moveCard(context.confiscate, 'hand');
                    context.player1.readyResources(5);
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Controller plays an event with 1 discount
                context.player1.clickCard(context.bibFortuna);

                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Play an event from your hand. It costs 1 less.']);
                context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');

                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate, context.surpriseStrike]);
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.capitalCity);

                expect(context.bibFortuna.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // cost discount from bib fortuna should be gone
                context.player1.clickCard(context.confiscate);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 2: Controller skips playing an event, discount should not be applied
                context.player1.clickCard(context.bibFortuna);

                context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
                context.player1.clickPrompt('Choose no target');

                expect(context.bibFortuna.exhausted).toBe(true);

                context.player2.passAction();

                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.capitalCity);

                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 3: Controller should be able to select and play an event that costs exactly 1 more than ready resources
                context.player1.setResourceCount(0);

                context.player1.clickCard(context.bibFortuna);

                context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate]);
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.capitalCity);

                expect(context.bibFortuna.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
