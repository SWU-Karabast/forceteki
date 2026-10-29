describe('Imposing Scout Walker', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['imposing-scout-walker'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    }
                });
            });

            it('should allow to deal 3 damage to a ground unit and give 3 Advantage tokens if defeated', function() {
                const { context } = contextRef;

                // Play Imposing Scout Walker, trigger When Played ability
                context.player1.clickCard(context.imposingScoutWalker);

                expect(context.player1).toHavePrompt('Deal 3 damage to a ground unit. If it\'s defeated this way, give 3 Advantage tokens to this unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.imposingScoutWalker]);
                expect(context.player1).toHavePassAbilityButton();

                // Deal 3 damage to a ground unit
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.imposingScoutWalker).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow to deal 3 damage to a ground unit but not give Advantage tokens if the unit is not defeated', function() {
                const { context } = contextRef;

                // Play Imposing Scout Walker, trigger When Played ability
                context.player1.clickCard(context.imposingScoutWalker);

                expect(context.player1).toHavePrompt('Deal 3 damage to a ground unit. If it\'s defeated this way, give 3 Advantage tokens to this unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.imposingScoutWalker]);
                expect(context.player1).toHavePassAbilityButton();

                // Deal 3 damage to a ground unit
                context.player1.clickCard(context.wampa);

                expect(context.imposingScoutWalker.upgrades.length).toBe(0);
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to pass the ability without dealing damage', function() {
                const { context } = contextRef;

                // Play Imposing Scout Walker, trigger When Played ability
                context.player1.clickCard(context.imposingScoutWalker);

                expect(context.player1).toHavePrompt('Deal 3 damage to a ground unit. If it\'s defeated this way, give 3 Advantage tokens to this unit');
                expect(context.player1).toHavePassAbilityButton();

                // Pass the ability without dealing damage
                context.player1.clickPrompt('Pass');

                expect(context.imposingScoutWalker.upgrades.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('its When Played ability, when the damage is prevented', function() {
            it('should not throw or give Advantage tokens when the damage is prevented (Umbaran Mobile Cannon)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['imposing-scout-walker']
                    },
                    player2: {
                        groundArena: ['umbaran-mobile-cannon']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.imposingScoutWalker);
                context.player1.clickCard(context.umbaranMobileCannon);

                expect(context.umbaranMobileCannon.damage).toBe(0);
                expect(context.imposingScoutWalker).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});