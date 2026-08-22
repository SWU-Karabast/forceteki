describe('Darth Sidious, There is No Mercy', function() {
    integration(function(contextRef) {
        describe('Darth Sidious\'s leader side ability', function() {
            const exhaustAbilityPrompt = 'Exhaust this leader to deal 1 damage to a different unit or base';

            it('should prompt to exhaust and deal 1 damage to a different unit when dealing exactly 4 combat damage to an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        groundArena: ['massassi-group-marines']
                    },
                    player2: {
                        groundArena: ['cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // Massassi Group Marines (4 power) attacks Cantina Bouncer (5 HP), dealing exactly 4 damage
                context.player1.clickCard(context.massassiGroupMarines);
                context.player1.clickCard(context.cantinaBouncer);
                expect(context.cantinaBouncer.damage).toBe(4);

                // Sidious's ability triggers
                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Trigger');

                // The leader is exhausted, and the just-damaged unit is excluded from the ping target
                expect(context.darthSidious.exhausted).toBeTrue();
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.massassiGroupMarines]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.cantinaBouncer.damage).toBe(4);
            });

            it('should trigger when 4 or more damage is dealt to a unit by an ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        hand: ['open-fire']
                    },
                    player2: {
                        groundArena: ['cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // Open Fire deals exactly 4 damage to Cantina Bouncer
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.cantinaBouncer);
                expect(context.cantinaBouncer.damage).toBe(4);

                // Sidious's ability triggers
                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Trigger');

                // The leader exhausts, then deals 1 follow-up damage to the enemy base
                expect(context.darthSidious.exhausted).toBeTrue();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
            });

            it('should trigger when 4 or more damage is dealt to a base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        groundArena: ['massassi-group-marines']
                    }
                });

                const { context } = contextRef;

                // Massassi Group Marines (4 power) attacks the enemy base directly
                context.player1.clickCard(context.massassiGroupMarines);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Trigger');

                // p2Base is excluded since it's the object that was just damaged
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.massassiGroupMarines]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);
            });

            it('should not trigger and should leave the leader unexhausted when exactly 3 damage is dealt to a base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine (3 power) attacks the enemy base directly, dealing only 3 damage
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // No trigger, so it's immediately player2's turn
                expect(context.player2).toBeActivePlayer();
                expect(context.darthSidious.exhausted).toBeFalse();
            });

            it('should not exhaust the leader or deal follow-up damage if the player declines the optional ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        groundArena: ['massassi-group-marines']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.massassiGroupMarines);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Pass');

                expect(context.darthSidious.exhausted).toBeFalse();
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not deal follow-up damage if the leader is already exhausted when the ability triggers', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        groundArena: ['massassi-group-marines', 'assassin-probe']
                    },
                    player2: {
                        groundArena: ['cantina-bouncer', 'populist-champion']
                    }
                });

                const { context } = contextRef;

                // First attack: deals 4 damage, triggers the ability, and exhausts the leader
                context.player1.clickCard(context.massassiGroupMarines);
                context.player1.clickCard(context.cantinaBouncer);
                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);

                expect(context.darthSidious.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(1);

                context.player2.passAction();

                // Second attack: also deals 4+ damage, but the leader is already exhausted, so
                // exhausting it is a no-op and the ability cannot be legally triggered
                context.player1.clickCard(context.assassinProbe);
                context.player1.clickCard(context.populistChampion);
                expect(context.populistChampion.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should only exclude the exact object that was dealt 4 or more damage, allowing all other units and bases to be selected', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        groundArena: ['massassi-group-marines', 'wampa']
                    },
                    player2: {
                        groundArena: ['cantina-bouncer', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.massassiGroupMarines);
                context.player1.clickCard(context.cantinaBouncer);
                expect(context.cantinaBouncer.damage).toBe(4);

                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Trigger');

                // Every unit and base except the just-damaged Cantina Bouncer is selectable,
                // regardless of controller
                expect(context.player1).toBeAbleToSelectExactly([
                    context.p1Base,
                    context.p2Base,
                    context.massassiGroupMarines,
                    context.wampa,
                    context.battlefieldMarine
                ]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('should trigger when a player deals 4 or more damage to their own unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-sidious#there-is-no-mercy',
                        hand: ['open-fire'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player1 deals the 4 damage from Open Fire to their own Wampa
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);

                expect(context.player1).toHavePassAbilityPrompt(exhaustAbilityPrompt);
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
            });
        });

        describe('Darth Sidious\'s leader unit side ability', function() {
            const abilityPrompt = 'Deal 1 damage to a different unit or base';

            it('should prompt to deal 1 damage to a different unit or base when 4 or more damage is dealt to a unit, without an exhaust step', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        hand: ['open-fire']
                    },
                    player2: {
                        groundArena: ['cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // Open Fire deals exactly 4 damage to Cantina Bouncer
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.cantinaBouncer);
                expect(context.cantinaBouncer.damage).toBe(4);

                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.darthSidious]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.cantinaBouncer.damage).toBe(4);
            });

            it('should not trigger when exactly 3 damage is dealt to a base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine (3 power) attacks the enemy base directly, dealing only 3 damage
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // No trigger, so it's immediately player2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('can be declined by the player', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        hand: ['open-fire']
                    },
                    player2: {
                        groundArena: ['cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // Open Fire deals exactly 4 damage to Cantina Bouncer
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.cantinaBouncer);
                expect(context.cantinaBouncer.damage).toBe(4);

                // Player declines the optional ability
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // No damage is dealt anywhere else, and it becomes player2's turn
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger from indirect damage, attributing it to the ability\'s controller rather than the assigning player', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        hand: ['torpedo-barrage']
                    }
                });

                const { context } = contextRef;

                // Player1 (Sidious's controller) casts Torpedo Barrage targeting player2
                context.player1.clickCard(context.torpedoBarrage);
                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Deal 5 indirect damage to a player\'');
                context.player1.clickPrompt('Deal indirect damage to opponent');

                // Player2's base is the only legal indirect damage target, so it's auto-assigned
                // all 5 damage in a single instance without a distribution prompt
                expect(context.p2Base.damage).toBe(5);

                // Even though player2 assigned the damage, player1 (the ability's controller) is
                // the one who is considered to have dealt it, so player1's Sidious triggers
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.darthSidious]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);
            });

            it('should trigger from direct Overwhelm damage dealt directly to the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        groundArena: [{ card: 'emperor-palpatine#master-of-the-dark-side', upgrades: ['fallen-lightsaber'] }]
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Stormtrooper is defeated from the On Attack ability, so all damage goes to base
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(9);

                // The ability is triggered for the 4+ damage dealt to base
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.darthSidious, context.emperorPalpatine]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);
            });

            it('should trigger once for each separate qualifying instance when Fear and Dead Men deals 4 damage to multiple enemy ground units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        hand: ['fear-and-dead-men']
                    },
                    player2: {
                        groundArena: ['wampa', 'cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // Fear and Dead Men deals 4 damage to each enemy ground unit
                context.player1.clickCard(context.fearAndDeadMen);
                expect(context.wampa.damage).toBe(4);
                expect(context.cantinaBouncer.damage).toBe(4);
                expect(context.darthSidious.damage).toBe(0);

                expect(context.player1).toHavePrompt(`Resolve "${abilityPrompt}"`);
                expect(context.player1).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                context.player1.clickPrompt('Resolve all (2)');

                // First trigger is for the Wampa, so that unit is not selectable
                expect(context.player1).toHavePrompt(`${abilityPrompt}: Wampa`);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.darthSidious, context.cantinaBouncer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);

                // Second trigger is for the Cantina Bouncer, so that unit is not selectable
                expect(context.player1).toHavePrompt(`${abilityPrompt}: Cantina Bouncer`);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.darthSidious, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when an enemy unit deals 4 or more combat damage back to a friendly attacker', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        groundArena: ['cantina-bouncer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Cantina Bouncer (3 power) attacks Wampa (4 power); Wampa deals 4 combat damage back to
                // the attacker, but that damage was dealt by the enemy, so player1's Sidious does not trigger
                context.player1.clickCard(context.cantinaBouncer);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
                expect(context.cantinaBouncer.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger when a friendly unit deals 4 or more combat damage back while defending', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        groundArena: ['wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['cantina-bouncer']
                    }
                });

                const { context } = contextRef;

                // Cantina Bouncer (3 power) attacks Wampa (4 power); while defending, Wampa deals 4 combat
                // damage back to the attacker. A friendly unit dealt it, so player1's Sidious triggers even
                // on the opponent's turn
                context.player2.clickCard(context.cantinaBouncer);
                context.player2.clickCard(context.wampa);
                expect(context.cantinaBouncer.damage).toBe(4);
                expect(context.wampa.damage).toBe(3);

                // The just-damaged Cantina Bouncer is excluded from the ping targets
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.darthSidious, context.wampa]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
