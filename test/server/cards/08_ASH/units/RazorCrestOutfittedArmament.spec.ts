describe('Razor Crest: Outfitted Armament', function() {
    const onAttackAbilityTitle = 'Discard a card from your hand. If you do, this unit gets +2/+0 for this attack';
    integration(function(contextRef) {
        describe('its On Attack ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['razor-crest#outfitted-armament'],
                        hand: ['takedown', 'surprise-strike']
                    }
                });
            });

            it('should deal +2 damage to the base when the player discards a card', function() {
                const { context } = contextRef;

                // Razor Crest attacks the base, On Attack ability triggers
                context.player1.clickCard(context.razorCrest);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(onAttackAbilityTitle);
                context.player1.clickPrompt('Trigger');

                // Player selects which card to discard
                expect(context.player1).toBeAbleToSelectExactly([context.takedown, context.surpriseStrike]);
                context.player1.clickCard(context.takedown);

                // Razor Crest deals 5 damage (3 base power + 2 from buff)
                expect(context.p2Base.damage).toBe(5);
                expect(context.takedown).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal only 3 damage when the player declines to discard', function() {
                const { context } = contextRef;

                // Razor Crest attacks the base, On Attack ability triggers
                context.player1.clickCard(context.razorCrest);
                context.player1.clickCard(context.p2Base);

                // Player passes the optional discard
                expect(context.player1).toHavePassAbilityPrompt(onAttackAbilityTitle);
                context.player1.clickPrompt('Pass');

                // Razor Crest deals only 3 damage (base power, no buff)
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should apply the +2/+0 buff only for the current attack', function() {
                const { context } = contextRef;

                // First attack: player discards to get +2/+0
                context.player1.clickCard(context.razorCrest);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(onAttackAbilityTitle);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.takedown);

                // First attack deals 5 damage (3 base + 2 buff)
                expect(context.p2Base.damage).toBe(5);

                // Advance to next action phase so Razor Crest is ready again
                context.player2.passAction();
                context.moveToNextActionPhase();

                // Second attack: player declines the discard
                context.player1.clickCard(context.razorCrest);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(onAttackAbilityTitle);
                context.player1.clickPrompt('Pass');

                // Second attack deals only 3 damage — buff did not persist from previous attack
                expect(context.p2Base.damage).toBe(8); // 5 from first attack + 3 from second
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not present the discard prompt when player has no cards in hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['razor-crest#outfitted-armament']
                }
            });

            const { context } = contextRef;

            // With empty hand, no discard prompt appears — base power only
            context.player1.clickCard(context.razorCrest);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should strip a Shield via Saboteur before the +2/+0 buff is applied to combat damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['razor-crest#outfitted-armament'],
                    hand: ['takedown']
                },
                player2: {
                    spaceArena: [{ card: 'system-patrol-craft', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            // Razor Crest has Saboteur — both Saboteur and the On Attack discard ability trigger simultaneously
            context.player1.clickCard(context.razorCrest);
            context.player1.clickCard(context.systemPatrolCraft);

            // Multi-trigger prompt: choose which ability to resolve first
            expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
            context.player1.clickPrompt('Saboteur: defeat all shields');

            // Shield is defeated — System Patrol Craft now has no upgrades
            expect(context.systemPatrolCraft.upgrades.length).toBe(0);

            // Optional On Attack ability prompts to discard
            expect(context.player1).toHavePassAbilityPrompt(onAttackAbilityTitle);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.takedown);

            // Razor Crest has 5 power (3 + 2 buff); System Patrol Craft has 4 HP — it is defeated
            expect(context.systemPatrolCraft).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
