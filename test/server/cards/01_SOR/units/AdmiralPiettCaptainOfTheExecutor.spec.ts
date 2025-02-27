describe('Admiral Piett, Captain of the Executor\'s Folly', function() {
    integration(function(contextRef) {
        describe('Admiral Piett\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['relentless#konstantines-folly', 'battlefield-marine', 'clan-saxon-gauntlet'],
                        groundArena: ['admiral-piett#captain-of-the-executor'],
                        leader: 'hera-syndulla#spectre-two',
                        resources: 30
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['redemption#medical-frigate'],
                        hand: ['atst']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give Ambush to friendly non-leader units with cost 6 or greater', function () {
                const { context } = contextRef;

                // CASE 1: friendly non-leader unit cost >= 6, gains Ambush
                context.player1.clickCard(context.relentless);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);
                context.player1.clickPrompt('Ambush');
                expect(context.relentless.exhausted).toBeTrue();
                expect(context.relentless.damage).toBe(6);
                expect(context.redemption.damage).toBe(8);

                // CASE 2: enemy non-leader unit cost >= 6, does not gain Ambush
                context.player2.clickCard(context.atst);
                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('groundArena');

                // CASE 3: friendly non-leader unit cost < 6, does not gain Ambush
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('groundArena');

                context.player2.passAction();

                // CASE 4: friendly leader unit cost >= 6, does not gain Ambush
                context.player1.clickCard(context.heraSyndulla);
                expect(context.player2).toBeActivePlayer();
                expect(context.heraSyndulla).toBeInZone('groundArena');

                // CASE 5: Piett is defeated, effect goes away
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.admiralPiett);
                context.player1.clickCard(context.clanSaxonGauntlet);
                expect(context.player2).toBeActivePlayer();
                expect(context.clanSaxonGauntlet.damage).toBe(0);
            });
        });
    });
});
