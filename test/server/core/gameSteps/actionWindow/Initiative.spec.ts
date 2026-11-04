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
                context.player1.clickDone();
                context.player2.clickDone();

                // New phase
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'Claim Initiative']);
                expect(context.ardentSympathizer.getPower()).toBe(5);

                // Case 2 player1 passes and player2 immediately claims ending the phase
                context.player1.passAction();
                context.player2.claimInitiative();

                // Regroup phase
                expect(context.ardentSympathizer.getPower()).toBe(3);
                expect(context.player2).toHaveExactPromptButtons(['Skip Resourcing']);
                expect(context.player1).toHaveExactPromptButtons(['Skip Resourcing']);

                context.player2.clickDone();
                context.player1.clickDone();

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
                expect(context.player2).toHaveExactPromptButtons(['Skip Resourcing']);
                expect(context.player1).toHaveExactPromptButtons(['Skip Resourcing']);

                context.player2.clickDone();
                context.player1.clickDone();

                // New phase
                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toHaveExactPromptButtons(['Pass', 'Claim Initiative']);
            });

            it('should ignore a claim initiative command once initiative has already been claimed this round', function () {
                const { context } = contextRef;

                context.player1.claimInitiative();
                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toHaveExactPromptButtons(['Pass']);

                // send the command directly, the way a client would, even though the button is not offered
                const promptUuid = context.player2.player.currentPrompt().buttons[0].uuid;
                try {
                    context.game.menuButton(context.player2.player.id, 'claimInitiative', promptUuid, undefined);
                } catch {
                    // rejecting the command with an error is also acceptable
                }
                context.game.continue();

                expect(context.game.initiativePlayer).toBe(context.player1.player);
                expect(context.game.currentPhase).toBe('action');
                expect(context.player2).toBeActivePlayer();
                expect(context.player2).toHaveExactPromptButtons(['Pass']);
            });
        });
    });
});
