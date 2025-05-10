describe('Sifo Dyas, Commissioning an Army', () => {
    integration(function (contextRef) {
        describe('Sifo Dyas, Commissioning an Army\' ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sifodyas#commissioning-an-army'],
                        deck: ['crosshair#following-orders', 'pyke-sentinel', 'atst', 'wrecker#boom', 'coruscant-guard', 'fives#in-search-of-truth', 'batch-brothers', 'clone-heavy-gunner', 'vigilance', 'omega#part-of-the-squad']
                    },
                    player2: {
                        hand: ['vanquish', 'no-glory-only-results'],
                        deck: ['clone-pilot', 'tech#source-of-insight', 'bunker-defender', 'rivals-fall', 'twin-laser-turret', 'repair', 'aggression', 'republic-tactical-officer', 'echo#restored']
                    }
                });
            });

            it('may allow the player to search their deck for one Clone unit with cost 4 or less and play it from the discard pile for free', () => {
                const { context } = contextRef;

                // Defeat Sifo Dyas
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.sifodyas);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Select all cards to reveal');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.crosshair, context.batchBrothers, context.coruscantGuard, context.cloneHeavyGunner],
                    invalid: [context.pykeSentinel, context.atst, context.wrecker, context.fives]
                });
                context.player1.clickCardInDisplayCardPrompt(context.batchBrothers);
                context.player1.clickPrompt('Done');

                // Play Batch Brothers for free
                const playerResources = context.player1.resources.length;
                expect(context.sifodyas).toBeInZone('discard');
                expect(context.batchBrothers).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelect(context.batchBrothers);

                context.player1.clickCard(context.batchBrothers);
                expect(context.batchBrothers).toBeInZone('groundArena');

                // Check players resources
                expect(context.player1.readyResourceCount).toBe(playerResources);
                expect(context.crosshair).toBeInZone('deck');
            });

            it('may allow the player to search their deck for one Clone unit with cost 4 or less and play it from the discard pile for free, player chooses not to play it', () => {
                const { context } = contextRef;

                // Defeat Sifo Dyas
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.sifodyas);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Select all cards to reveal');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.crosshair, context.batchBrothers, context.coruscantGuard, context.cloneHeavyGunner],
                    invalid: [context.pykeSentinel, context.atst, context.wrecker, context.fives]
                });
                context.player1.clickCardInDisplayCardPrompt(context.batchBrothers);
                context.player1.clickPrompt('Done');

                // Game moves to next action phase
                expect(context.player1).toBeAbleToSelect(context.batchBrothers);
                context.moveToNextActionPhase();
                expect(context.player1).not.toBeAbleToSelect(context.batchBrothers);
            });

            it('may allow the player to search their deck for 2 Clone units with combined cost 4 or less and play them from the discard pile for free', () => {
                const { context } = contextRef;

                // Defeat Sifo Dyas
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.sifodyas);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Select all cards to reveal');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.crosshair, context.batchBrothers, context.coruscantGuard, context.cloneHeavyGunner],
                    invalid: [context.pykeSentinel, context.atst, context.wrecker, context.fives]
                });
                context.player1.clickCardInDisplayCardPrompt(context.coruscantGuard);
                context.player1.clickCardInDisplayCardPrompt(context.cloneHeavyGunner);
                context.player1.clickPrompt('Done');

                // Play Batch Brothers for free
                const playerResources = context.player1.resources.length;
                expect(context.sifodyas).toBeInZone('discard');
                expect(context.cloneHeavyGunner).toBeInZone('discard');
                expect(context.coruscantGuard).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();

                context.player1.clickCard(context.coruscantGuard);
                expect(context.coruscantGuard).toBeInZone('groundArena');

                // Pass the action to allow the player to play the second card
                context.player2.passAction();
                context.player1.clickCard(context.cloneHeavyGunner);
                expect(context.cloneHeavyGunner).toBeInZone('groundArena');

                // Check players resources
                expect(context.player1.readyResourceCount).toBe(playerResources);
            });

            it('may allow the opponent to search their deck for Clone units with combined cost 4 or less and play them from the discard pile for free, No Glory Only Results interaction', () => {
                const { context } = contextRef;

                // Defeat Sifo Dyas
                context.player1.passAction();
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.sifodyas);

                // Check prompt for optional ability
                expect(context.player2).toHavePrompt('Select all cards to reveal');

                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.clonePilot, context.tech, context.republicTacticalOfficer],
                    invalid: [context.bunkerDefender, context.rivalsFall, context.twinLaserTurret, context.repair, context.aggression]
                });
                context.player2.clickCardInDisplayCardPrompt(context.republicTacticalOfficer);
                context.player2.clickCardInDisplayCardPrompt(context.clonePilot);
                context.player2.clickPrompt('Done');

                // Play Batch Brothers for free
                const playerResources = context.player2.resources.length;
                expect(context.sifodyas).toBeInZone('discard', context.player1);
                expect(context.republicTacticalOfficer).toBeInZone('discard', context.player2);
                expect(context.clonePilot).toBeInZone('discard', context.player2);
                expect(context.player1).toBeActivePlayer();

                context.player1.passAction();
                context.player2.clickCard(context.republicTacticalOfficer);
                expect(context.republicTacticalOfficer).toBeInZone('groundArena');

                // Pass the action to allow the player to play the second card
                context.player1.passAction();
                context.player2.clickCard(context.clonePilot);
                expect(context.clonePilot).toBeInZone('groundArena');

                // Check players resources
                expect(context.player1.readyResourceCount).toBe(playerResources);
            });

            it('may allow the opponent to search their deck for Clone units with combined cost 4 or less but player choose not to discard them', () => {
                const { context } = contextRef;

                // Defeat Sifo Dyas
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.sifodyas);

                // Check prompt for optional ability
                expect(context.player1).toHavePrompt('Select all cards to reveal');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.crosshair, context.batchBrothers, context.coruscantGuard, context.cloneHeavyGunner],
                    invalid: [context.pykeSentinel, context.atst, context.wrecker, context.fives]
                });
                context.player1.clickPrompt('Take nothing');

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
