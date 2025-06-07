describe('Calm in the Storm', function() {
    integration(function(contextRef) {
        describe('Calm in the Storm\'s ability', function() {
            it('exhausts a friendly unit and gives it a shield token and 2 experience tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['calm-in-the-storm'],
                        groundArena: ['battlefield-marine', 'luke-skywalker#a-heros-beginning', { card: 'pyke-sentinel', exhausted: true }],
                        spaceArena: ['relentless#konstantines-folly'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // Verify no unit is exhausted or has tokens at the start
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.battlefieldMarine.upgrades.length).toBe(0);

                // Play Calm in the Storm
                context.player1.clickCard(context.calmInTheStorm);

                // Should be able to select only non-exhausted friendly units
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.lukeSkywalkerAHerosBeginning,
                    context.relentless,
                    context.pykeSentinel, // valid target -- just won't do anything
                ]);

                // Select the battlefield marine to exhaust
                context.player1.clickCard(context.battlefieldMarine);

                // Verify the unit is now exhausted
                expect(context.battlefieldMarine.exhausted).toBe(true);

                // Verify shield and experience tokens were added
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield', 'experience', 'experience']);
            });

            it('does not add upgrades if the unit was already exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['calm-in-the-storm'],
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'luke-skywalker#a-heros-beginning', exhausted: true },
                            { card: 'pyke-sentinel', exhausted: true }
                        ],
                        spaceArena: ['relentless#konstantines-folly'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;


                // Verify no upgrades initially
                expect(context.battlefieldMarine.upgrades.length).toBe(0);

                // Play Calm in the Storm
                context.player1.clickCard(context.calmInTheStorm);

                // Should still be able to target exhausted friendly units
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.lukeSkywalkerAHerosBeginning,
                    context.relentless,
                    context.pykeSentinel
                ]);

                // Select the battlefield marine
                context.player1.clickCard(context.battlefieldMarine);

                // Verify the unit remains exhausted (was already exhausted)
                expect(context.battlefieldMarine.exhausted).toBe(true);

                // Verify NO shield or experience tokens were added (because exhaust failed)
                expect(context.battlefieldMarine.upgrades.length).toBe(0);
            });
        });
    });
});
