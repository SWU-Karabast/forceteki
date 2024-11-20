describe('Bib Fortuna', function() {
    integration(function(contextRef) {
        describe('Bib Fortuna\'s activated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bib-fortuna#jabbas-majordomo', 'jawa-scavenger'],
                        hand: ['repair', 'confiscate', 'swoop-racer', 'surprise-strike'],
                        base: 'capital-city',
                        leader: 'grand-inquisitor#hunting-the-jedi',
                    },
                });
            });

            it('should allow the controller to play an event with a discount of 1', function () {
                const { context } = contextRef;

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

                context.player2.passAction();
                context.bibFortuna.exhausted = false;
            });

            it('should not give the next unit played by the controller a discount after the controller declines to play a unit with the ability', function() {
                const { context } = contextRef;

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
            });

            it('should be able to select and play an event that costs exactly 1 more than ready resources', function() {
                const { context } = contextRef;
                context.player1.setResourceCount(0);

                context.player1.clickCard(context.bibFortuna);

                context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.capitalCity);

                expect(context.bibFortuna.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
