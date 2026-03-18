describe('Fives, I Have Proof!', function() {
    integration(function(contextRef) {
        const copyPrompt = 'Choose a unit to copy "When Played" abilities from';

        describe('pre-enter play ability', function() {
            describe('when a unit with a When Played ability is in play', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                            base: 'dagobah-swamp',
                            hand: ['fives#i-have-proof'],
                            groundArena: ['battlefield-marine'],
                        },
                        player2: {
                            spaceArena: ['patrolling-vwing'],
                        }
                    });
                });

                it('should copy When Played ability from the selected unit and trigger it on enter play', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.fives);
                    expect(context.player1).toHavePrompt(copyPrompt);
                    expect(context.player1).toHavePassAbilityButton();

                    // Only units with When Played abilities should be selectable
                    expect(context.player1).toBeAbleToSelectExactly([context.patrollingVwing]);

                    // Select V-Wing to copy its "Draw a card" When Played ability
                    context.player1.clickCard(context.patrollingVwing);

                    // Fives enters play and the copied When Played triggers, drawing a card
                    expect(context.fives).toBeInZone('groundArena');
                    expect(context.player1.handSize).toBe(1); // Fives left hand (0), drew 1 card
                    expect(context.player1.exhaustedResourceCount).toBe(6);
                });

                it('can be declined', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.fives);
                    expect(context.player1).toHavePrompt(copyPrompt);

                    // Pass on the ability
                    context.player1.clickPrompt('Pass');

                    // Fives enters play without the copied ability, no draw
                    expect(context.fives).toBeInZone('groundArena');
                    expect(context.player1.handSize).toBe(0); // Fives left hand, no draw
                });
            });

            it('should only copy When Played abilities, not other ability types', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                    },
                    player2: {
                        groundArena: ['darth-vader#twilight-of-the-apprentice'],
                    }
                });

                const { context } = contextRef;

                // Play Fives, copy Vader's When Played ability
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.darthVader);

                // When Played triggers: player1 selects friendly and enemy units for shields
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.darthVader);

                expect(context.fives).toHaveExactUpgradeNames(['shield']);
                expect(context.darthVader).toHaveExactUpgradeNames(['shield']);

                // Fives keeps his own stats, not Vader's
                expect(context.fives.getPower()).toBe(6);
                expect(context.fives.getHp()).toBe(6);

                // Move to next action phase so Fives readies
                context.moveToNextActionPhase();

                // Attack with Fives - should NOT trigger Vader's On Attack ability
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.p2Base);

                // No On Attack prompt to defeat an enemy unit with a shield
                expect(context.player2).toBeActivePlayer();
            });

            it('should not show prompt when no units have When Played abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Play Fives - no units have When Played abilities, so ability auto-skips
                context.player1.clickCard(context.fives);

                // Fives enters play without any copied ability
                expect(context.fives).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should have Sentinel keyword', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        hand: ['fives#i-have-proof'],
                    },
                    player2: {
                        spaceArena: ['patrolling-vwing'],
                    }
                });

                const { context } = contextRef;

                // Play Fives copying V-Wing's ability
                context.player1.clickCard(context.fives);
                context.player1.clickCard(context.patrollingVwing);

                expect(context.fives).toBeInZone('groundArena');
                expect(context.fives.hasSomeKeyword('sentinel')).toBeTrue();
            });
        });
    });
});
