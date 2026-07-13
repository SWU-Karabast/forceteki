describe('Darth Vader, No One to Stop Us', function() {
    integration(function(contextRef) {
        describe('its leader side ability', function() {
            it('should pay 1 resource, exhaust Vader, defeat a chosen friendly unit, draw a card, and heal 2 damage from own base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        base: { card: 'dagobah-swamp', damage: 3 },
                        groundArena: ['battlefield-marine', 'wampa'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.handSize;

                // Activate leader ability — must select a friendly unit to defeat as cost
                context.player1.clickCard(context.darthVader);
                expect(context.player1).toHavePrompt('Choose a friendly unit to defeat');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Enemy units are not selectable
                    context.battlefieldMarine,
                    context.wampa
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine is defeated as cost, Vader exhausts, 1 resource spent
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.darthVader.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Drew a card, healed 2 damage from base (3 → 1)
                expect(context.player1.handSize).toBe(initialHandSize + 1);
                expect(context.p1Base.damage).toBe(1);
                expect(context.getChatLogs(1)).toContain('player1 uses Darth Vader, exhausting Darth Vader and defeating Battlefield Marine to draw a card and then to heal 2 damage from their base');
            });

            it('should not heal base beyond 0 when base has less than 2 damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        base: { card: 'dagobah-swamp', damage: 1 },
                        groundArena: ['battlefield-marine'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.battlefieldMarine);

                // Only 1 damage present — heal is capped at 0
                expect(context.p1Base.damage).toBe(0);
            });

            it('should not be available when player controls no friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        resources: 5
                    }
                });

                const { context } = contextRef;

                expect(context.darthVader).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should not be available when player has insufficient resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        groundArena: ['battlefield-marine'],
                        resources: {
                            readyCount: 0,
                            exhaustedCount: 5
                        }
                    }
                });

                const { context } = contextRef;

                expect(context.darthVader).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should resolve the sacrificed unit\'s When Defeated ability after Darth Vader\'s ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        base: { card: 'dagobah-swamp', damage: 2 },
                        groundArena: ['vanguard-infantry', 'wampa'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Activate leader ability — select Vanguard Infantry (has When Defeated: give Experience to a unit)
                context.player1.clickCard(context.darthVader);
                expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry, context.wampa]);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.vanguardInfantry).toBeInZone('discard');

                // Check that Darth Vader's effects fully resolved before the When Defeated ability of Vanguard Infantry triggers
                expect(context.player1.handSize).toBe(1);
                expect(context.p1Base.damage).toBe(0);

                // Vanguard Infantry's When Defeated triggers — give Experience to Wampa
                expect(context.player1).toHavePrompt('Give an Experience token to a unit');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            });

            it('should take 3 damage from the empty-deck draw and heal 2, netting 1 damage to the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        base: 'dagobah-swamp',
                        groundArena: ['wampa'],
                        deck: [],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Drawing from an empty deck deals 3 damage to the base; healing 2 nets 1 damage
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.handSize).toBe(0);
                expect(context.p1Base.damage).toBe(1);
            });

            it('should defeat the base when it has 2 remaining HP and an empty deck, because the empty-deck draw resolves before the heal', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#no-one-to-stop-us',
                        // Dagobah Swamp has 30 HP — 28 damage leaves 2 remaining HP
                        base: { card: 'dagobah-swamp', damage: 28 },
                        groundArena: ['wampa'],
                        deck: [],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // The draw and heal are sequential (draw is printed first), so the empty-deck draw
                // deals 3 damage to the base before the heal can resolve, defeating the base
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.wampa);

                expect(context.game).toBeOver();
                expect(context.player2).toBeGameWinner();

                context.player1.clickPrompt('Continue Playing');
                context.player2.clickPrompt('Continue Playing');
            });
        });

        describe('its leader unit side On Attack ability', function() {
            it('should defeat another friendly unit, draw a card, and heal 2 damage when attacking the enemy base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#no-one-to-stop-us', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: ['battlefield-marine', 'wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.handSize;

                // Vader attacks the enemy base
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.p2Base);

                // On Attack triggers — optionally choose another friendly unit to defeat
                expect(context.player1).toHavePrompt('Defeat another friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine is defeated, drew a card, healed 2 from base (5 → 3)
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.handSize).toBe(initialHandSize + 1);
                expect(context.p1Base.damage).toBe(3);

                // Vader's combat damage reaches the enemy base
                expect(context.p2Base.damage).toBe(5);
                expect(context.getChatLogs(1)).toContain('player1 uses Darth Vader to draw a card and then to heal 2 damage from their base');
            });

            it('should allow declining the optional defeat — no draw or heal, but attack still deals damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#no-one-to-stop-us', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 4 },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.handSize;

                // Vader attacks the enemy base
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.p2Base);

                // Decline the optional defeat
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // No unit defeated, no draw, no heal — combat damage still resolves
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.handSize).toBe(initialHandSize);
                expect(context.p1Base.damage).toBe(4);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should skip the ability prompt and deal only combat damage when Vader is the only friendly unit in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#no-one-to-stop-us', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;
                const initialHandSize = context.player1.handSize;

                // Vader attacks — no other friendly units, optional ability has no valid targets and skips
                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.p2Base);

                // Ability skips entirely, it is now player2's turn
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(initialHandSize);
                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});
