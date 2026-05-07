describe('Mandalorian Flagship, Captured From The Empire', function() {
    integration(function(contextRef) {
        it('Mandalorian Flagship should gain Ambush while player controls a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mandalorian-flagship#captured-from-the-empire'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'han-solo#worth-the-risk', deployed: true }
                },
                player2: {
                    spaceArena: ['tieln-fighter']
                }
            });
            const { context } = contextRef;

            // Play Mandalorian Flagship - should have Ambush
            context.player1.clickCard(context.mandalorianFlagship);

            // Should trigger Ambush since we have a deployed leader
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // Can attack with Ambush
            expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter]);
            context.player1.clickCard(context.tielnFighter);

            // Attack resolves, both units deal damage to each other
            expect(context.tielnFighter).toBeInZone('discard'); // 8 damage defeats it
            expect(context.mandalorianFlagship.damage).toBe(2);
        });

        it('Mandalorian Flagship should not have Ambush without a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mandalorian-flagship#captured-from-the-empire'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'han-solo#worth-the-risk', deployed: false }
                },
                player2: {
                    spaceArena: ['tieln-fighter']
                }
            });
            const { context } = contextRef;

            // Play Mandalorian Flagship - no Ambush prompt
            context.player1.clickCard(context.mandalorianFlagship);

            // No ambush prompt, goes directly to next action
            expect(context.player2).toBeActivePlayer();
        });

        it('Mandalorian Flagship should get +1/+0 for each other friendly Mandalorian unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mandalorian-flagship#captured-from-the-empire'],
                    groundArena: ['mandalorian', 'mandalorian-warrior', 'mandalorian', 'wampa'],
                    spaceArena: ['sundari-gauntlet']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'sabine-wren#explosives-artist']
                }
            });
            const { context } = contextRef;

            // Play Mandalorian Flagship
            context.player1.clickCard(context.mandalorianFlagship);

            // Flagship has 4 base power + 3 for other Mandalorians = 7
            expect(context.mandalorianFlagship.getPower()).toBe(8);
            expect(context.mandalorianFlagship.getHp()).toBe(8);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mandalorian Flagship should update stats when other Mandalorians leave play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mandalorian-flagship#captured-from-the-empire', 'no-glory-only-results'],
                    groundArena: ['mandalorian', 'mandalorian-warrior'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            // Play Mandalorian Flagship
            context.player1.clickCard(context.mandalorianFlagship);
            expect(context.mandalorianFlagship.getPower()).toBe(6); // 4 + 2 other Mandalorians

            context.player2.passAction();

            // Remove a Mandalorian unit
            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.mandalorianWarrior);

            // Power should decrease
            expect(context.mandalorianFlagship.getPower()).toBe(5); // 4 + 1 other Mandalorian
        });
    });
});
