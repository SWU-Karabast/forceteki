describe('Claiming initiative', function() {
    integration(function(contextRef) {
        describe('Claiming initiative', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: ['ardent-sympathizer', 'baze-malbus#temple-guardian'],
                        base: { card: 'kestro-city', damage: 0 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['scout-bike-pursuer'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should make the one with initiative not be able to take any actions and go first in the next phase.', function () {
                const { context } = contextRef;
                // Case 1 after player1 claims player 2 can play multiple actions before passing
                context.player1.claimInitiative();
                expect(context.player2).toHaveExactPromptButtons(['Pass']);
                expect(context.ardentSympathizer.getPower()).toBe(5);
                context.player2.clickCard(context.scoutBikePursuer);

                expect(context.scoutBikePursuer).toBeInZone('groundArena');
                expect(context.player2).toHaveExactPromptButtons(['Pass']);
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.wampa);

                expect(context.bazeMalbus.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toHaveExactPromptButtons(['Pass']);
                context.player2.passAction();

                // Regroup phase
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // New phase
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'Claim Initiative']);
                expect(context.ardentSympathizer.getPower()).toBe(5);

                // Case 2 player1 passes and player2 immediately claims ending the phase
                context.player1.passAction();
                context.player2.claimInitiative();

                // Regroup phase
                expect(context.ardentSympathizer.getPower()).toBe(3);
                expect(context.player2).toHaveExactPromptButtons(['Done']);
                expect(context.player1).toHaveExactPromptButtons(['Done']);

                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                // New phase
                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toHaveExactPromptButtons(['Pass', 'Claim Initiative']);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(4);

                // Case 3 Both players pass ending the phase and player2 starts as the active player next phase.
                context.player1.passAction();
                context.player2.passAction();

                // Regroup phase
                expect(context.player2).toHaveExactPromptButtons(['Done']);
                expect(context.player1).toHaveExactPromptButtons(['Done']);

                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                // New phase
                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toHaveExactPromptButtons(['Pass', 'Claim Initiative']);
            });
        });
    });
});
