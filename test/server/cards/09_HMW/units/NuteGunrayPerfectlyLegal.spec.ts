describe('Nute Gunray, Perfectly Legal', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            const eachFriendlyUnitDealsDamagePrompt = 'Each friendly unit deals 1 damage to a different enemy unit';
            const dealDamagePrompt = (title: string) => `${title} deals 1 damage to an enemy unit`;

            it('deals 1 damage from each friendly unit to a distinct enemy unit when friendly and enemy unit counts are equal', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'rebel-pathfinder']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray
                context.player1.clickCard(context.nuteGunray);

                // Choose both friendly units to deal damage
                expect(context.player1).toHavePrompt(eachFriendlyUnitDealsDamagePrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray, context.wampa]);
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                // Nute Gunray deals its damage
                expect(context.player1).toHavePrompt(dealDamagePrompt('Nute Gunray'));
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder]);
                context.player1.clickCard(context.battlefieldMarine);

                // Wampa deals its damage to the remaining enemy unit
                expect(context.player1).toHavePrompt(dealDamagePrompt('Wampa'));
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder]);
                context.player1.clickCard(context.rebelPathfinder);

                // Both enemy units are damaged
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.rebelPathfinder.damage).toBe(1);
            });

            it('has Nute Gunray deal damage himself when he is the only friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray
                context.player1.clickCard(context.nuteGunray);

                // Nute Gunray is the only friendly unit, so he is the only valid choice
                expect(context.player1).toHavePrompt(eachFriendlyUnitDealsDamagePrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray]);
                context.player1.clickCard(context.nuteGunray);

                // Nute Gunray deals his damage
                expect(context.player1).toHavePrompt(dealDamagePrompt('Nute Gunray'));
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('only lets as many friendly units deal damage as there are enemy units when friendly units outnumber enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal'],
                        groundArena: ['wampa', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray
                context.player1.clickCard(context.nuteGunray);

                // Only 1 enemy unit is in play, so only 1 of the 3 friendly units may be chosen to deal damage
                expect(context.player1).toHavePrompt(eachFriendlyUnitDealsDamagePrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                // Wampa deals its damage
                expect(context.player1).toHavePrompt(dealDamagePrompt('Wampa'));
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder]);
                context.player1.clickCard(context.rebelPathfinder);

                // Only the chosen enemy unit is damaged, and the turn passes to P2
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('only lets one friendly unit deal damage to one enemy unit when enemy units outnumber friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'rebel-pathfinder', 'atst']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray
                context.player1.clickCard(context.nuteGunray);

                // Nute Gunray is the only friendly unit, so he is the only valid choice
                expect(context.player1).toHavePrompt(eachFriendlyUnitDealsDamagePrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray]);
                context.player1.clickCard(context.nuteGunray);

                // Nute Gunray deals damage to only one of the three enemy units
                expect(context.player1).toHavePrompt(dealDamagePrompt('Nute Gunray'));
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder, context.atst]);
                context.player1.clickCard(context.rebelPathfinder);

                // Only the chosen enemy unit is damaged
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
            });

            it('does not prompt or error when there are no enemy units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray; the ability has no valid targets and fizzles
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickDone();

                // Nute Gunray is still in play, undamaged, and the turn passes to P2
                expect(context.nuteGunray).toBeInZone('groundArena');
                expect(context.nuteGunray.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('excludes already-chosen enemy units from subsequent damage assignment steps', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'rebel-pathfinder', 'atst']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray, choosing both friendly units to deal damage
                context.player1.clickCard(context.nuteGunray);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray, context.wampa]);
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                // Nute Gunray deals damage to ATST
                expect(context.player1).toHavePrompt(dealDamagePrompt('Nute Gunray'));
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder, context.atst]);
                context.player1.clickCard(context.atst);

                // ATST is no longer a valid choice for Wampa's damage step
                expect(context.player1).toHavePrompt(dealDamagePrompt('Wampa'));
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.atst.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.rebelPathfinder.damage).toBe(0);
            });

            it('prevents damage to a Shielded enemy unit, defeating a Shield token instead, while other simultaneous damage still resolves', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }, 'rebel-pathfinder']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray, choosing both friendly units to deal damage
                context.player1.clickCard(context.nuteGunray);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray, context.wampa]);
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                // Nute Gunray deals damage to the Shielded Battlefield Marine
                expect(context.player1).toHavePrompt(dealDamagePrompt('Nute Gunray'));
                context.player1.clickCard(context.battlefieldMarine);

                // Wampa deals damage to Rebel Pathfinder
                expect(context.player1).toHavePrompt(dealDamagePrompt('Wampa'));
                context.player1.clickCard(context.rebelPathfinder);

                // Shield token absorbed the damage to Battlefield Marine, defeating the token instead
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);

                // Rebel Pathfinder still takes its damage as normal
                expect(context.rebelPathfinder.damage).toBe(1);
            });

            it('simultaneously defeats multiple 1 HP enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nute-gunray#perfectly-legal'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['offworld-jawa', 'disposable-b1']
                    }
                });

                const { context } = contextRef;

                // Play Nute Gunray, choosing both friendly units to deal damage
                context.player1.clickCard(context.nuteGunray);
                expect(context.player1).toBeAbleToSelectExactly([context.nuteGunray, context.wampa]);
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                // Nute Gunray deals damage to Offworld Jawa
                expect(context.player1).toHavePrompt(dealDamagePrompt('Nute Gunray'));
                context.player1.clickCard(context.offworldJawa);

                // Wampa deals damage to Disposable B1
                expect(context.player1).toHavePrompt(dealDamagePrompt('Wampa'));
                context.player1.clickCard(context.disposableB1);

                // Both 1 HP units are simultaneously defeated
                expect(context.offworldJawa).toBeInZone('discard');
                expect(context.disposableB1).toBeInZone('discard');
            });
        });
    });
});
