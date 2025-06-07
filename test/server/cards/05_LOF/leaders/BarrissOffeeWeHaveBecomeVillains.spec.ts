describe('Barriss Offee, We Have Become Villains', function() {
    integration(function(contextRef) {
        describe('Barriss Offee\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jawa-scavenger'],
                        hand: ['repair', 'confiscate', 'swoop-racer', 'surprise-strike'],
                        base: { card: 'capital-city', damage: 8 },
                        hasForceToken: true,
                        leader: 'barriss-offee#we-have-become-villains',
                    },
                });
            });

            it('should allow the controller to play an event with a discount of 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).toHaveEnabledPromptButtons(['Play an event from your hand. It costs 1 resource less.', 'Cancel']);
                context.player1.clickPrompt('Play an event from your hand. It costs 1 resource less.');

                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate, context.surpriseStrike]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.barrissOffee.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // cost discount from barriss offee should be gone
                context.player1.clickCard(context.confiscate);
                context.player1.clickPrompt('Play anyway');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('if controller skips playing an event discount should not be applied later', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffee);

                context.player1.clickPrompt('Play an event from your hand. It costs 1 resource less.');
                context.player1.clickPrompt('Choose nothing');

                expect(context.barrissOffee.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                context.player2.passAction();

                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to select and play an event that costs exactly 1 more than ready resources', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(0);

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate]);
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.barrissOffee.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow the controller to play an event with a discount of 1 if he does not have the force', function () {
                const { context } = contextRef;

                // disable the force
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).not.toHavePrompt('Play an event from your hand. It costs 1 resource less.');
                context.player1.clickPrompt('Cancel');
            });
        });

        describe('Barriss Offee\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jawa-scavenger'],
                        hand: ['repair', 'confiscate', 'swoop-racer', 'surprise-strike'],
                        base: { card: 'shadowed-undercity', damage: 8 },
                        hasForceToken: true,
                        leader: { card: 'barriss-offee#we-have-become-villains', deployed: true }
                    },
                });
            });

            it('should allow the controller to play an event with a discount of 1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).toHaveEnabledPromptButtons(['Play an event from your hand. It costs 1 resource less.', 'Attack', 'Cancel']);
                context.player1.clickPrompt('Play an event from your hand. It costs 1 resource less.');

                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate, context.surpriseStrike]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.barrissOffee.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // cost discount from barriss offee should be gone
                context.player1.clickCard(context.confiscate);
                context.player1.clickPrompt('Play anyway');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to play an event with a discount of 1 multiple times', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).toHaveEnabledPromptButtons(['Play an event from your hand. It costs 1 resource less.', 'Attack', 'Cancel']);
                context.player1.clickPrompt('Play an event from your hand. It costs 1 resource less.');

                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate, context.surpriseStrike]);
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.barrissOffee.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // get the force token
                context.player1.clickCard(context.barrissOffee);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.barrissOffee);

                context.player1.clickCard(context.confiscate);

                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to play an event with a discount of 1 even if Barriss Offee is exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffee);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate, context.surpriseStrike]);
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // cost discount from barriss offee should be gone
                context.player1.clickCard(context.confiscate);
                context.player1.clickPrompt('Play anyway');
                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('if controller skips playing an event discount should not be applied later', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrissOffee);

                context.player1.clickPrompt('Play an event from your hand. It costs 1 resource less.');
                context.player1.clickPrompt('Choose nothing');

                expect(context.barrissOffee.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();

                context.player2.passAction();

                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.player1.exhaustedResourceCount).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to select and play an event that costs exactly 1 more than ready resources', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(0);

                context.player1.clickCard(context.barrissOffee);

                context.player1.clickPrompt('Play an event from your hand. It costs 1 resource less.');
                expect(context.player1).toBeAbleToSelectExactly([context.repair, context.confiscate]);
                context.player1.clickCard(context.repair);
                // selects target for repair
                context.player1.clickCard(context.p1Base);

                expect(context.barrissOffee.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow the controller to play an event with a discount of 1 if he does not have the force', function () {
                const { context } = contextRef;

                // disable the force
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.barrissOffee);

                expect(context.player1).not.toHavePrompt('Play an event from your hand. It costs 1 resource less.');
                context.player1.clickPrompt('Cancel');
            });
        });
    });
});
