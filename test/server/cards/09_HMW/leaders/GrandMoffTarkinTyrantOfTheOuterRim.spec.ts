describe('Grand Moff Tarkin, Tyrant of the Outer Rim', function() {
    integration(function(contextRef) {
        describe('its undeployed leader side ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                        base: 'lake-country',
                        hand: ['trap-field', 'rebel-pathfinder']
                    }
                });
            });

            it('ignores the aspect penalty when playing a Fortify upgrade', function() {
                const { context } = contextRef;

                expect(context.grandMoffTarkin).toHaveOngoingEffect('Ignore the aspect penalties on upgrades with Fortify you play');

                // Play Trap Field (Fortify - Aggression, Heroism) on the base
                context.player1.clickCard(context.trapField);
                context.player1.clickCard(context.p1Base);

                // Aspect penalty is ignored, only the printed cost is paid
                expect(context.trapField).toBeAttachedTo(context.p1Base);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('still applies the aspect penalty to a non-Fortify off-aspect card', function() {
                const { context } = contextRef;

                // Play Rebel Pathfinder, which does not have Fortify
                context.player1.clickCard(context.rebelPathfinder);

                // Aspect penalty applies on top of the printed cost
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });

        describe('its deploy', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                        resources: 9
                    }
                });
            });

            it('starts as Grand Moff Tarkin in the base zone', function() {
                const { context } = contextRef;

                // Undeployed side is Grand Moff Tarkin, not a Vehicle
                expect(context.grandMoffTarkin.title).toBe('Grand Moff Tarkin');
                expect(context.grandMoffTarkin).toBeInZone('base');
                expect(context.grandMoffTarkin.hasSomeTrait('vehicle')).toBeFalse();
            });

            it('deploys into the space arena as The Death Star with its back-side traits', function() {
                const { context } = contextRef;

                // Deploy Grand Moff Tarkin
                context.player1.clickCard(context.grandMoffTarkin);
                context.player1.clickPrompt('Deploy Grand Moff Tarkin');

                // Leader unit side is The Death Star, with Vehicle, Capital Ship, and Imperial traits
                expect(context.grandMoffTarkin).toBeInZone('spaceArena');
                expect(context.grandMoffTarkin.title).toBe('The Death Star');
                expect(context.grandMoffTarkin.subtitle).toBe('Icon of Tyranny');
                expect(context.grandMoffTarkin.hasSomeTrait('vehicle')).toBeTrue();
                expect(context.grandMoffTarkin.hasSomeTrait('capital ship')).toBeTrue();
                expect(context.grandMoffTarkin.hasSomeTrait('imperial')).toBeTrue();
                expect(context.grandMoffTarkin.hasSomeTrait('official')).toBeFalse();
            });
        });

        describe('its deployed unit side aspect penalty ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true },
                        base: 'lake-country',
                        hand: ['trap-field']
                    }
                });
            });

            it('ignores the aspect penalty when playing a Fortify upgrade', function() {
                const { context } = contextRef;

                expect(context.grandMoffTarkin).toHaveOngoingEffect('Ignore the aspect penalties on upgrades with Fortify you play');

                // Play Trap Field (Fortify) on the base
                context.player1.clickCard(context.trapField);
                context.player1.clickCard(context.p1Base);

                // Aspect penalty is ignored, only the printed cost is paid
                expect(context.trapField).toBeAttachedTo(context.p1Base);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });

        describe('its deployed unit side regroup ability', function() {
            it('may defeat an enemy base with 10 or less remaining HP at the start of the regroup phase, winning the game', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 20 }
                    }
                });

                const { context } = contextRef;

                // Move to the regroup phase, triggering the ability
                context.moveToRegroupPhase();

                // Choose to defeat the enemy base. The optional trigger offers a target and a "Pass"
                // button, but no (inert) "Cancel" button since a triggered ability can't be cancelled.
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                expect(context.player1).not.toHaveEnabledPromptButton('Cancel');
                context.player1.clickCard(context.p2Base);

                // Base is defeated, player1 wins the game
                expect(context.game).toBeOver();
                expect(context.player1).toBeGameWinner();
            });

            it('may decline to defeat a base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 20 }
                    }
                });

                const { context } = contextRef;

                // Move to the regroup phase, triggering the ability
                context.moveToRegroupPhase();

                // Decline to defeat the base
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickPrompt('Pass');

                // Base remains in play, game continues
                expect(context.game).not.toBeOver();
                expect(context.p2Base.damage).toBe(20);
                expect(context.p2Base).not.toBeInZone('discard');
            });

            it('cannot target a base with more than 10 remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 19 }
                    }
                });

                const { context } = contextRef;

                // Move to the regroup phase; the base has more than 10 remaining HP, so there is no legal target
                context.moveToRegroupPhase();

                // Ability does not trigger, game continues unaffected
                expect(context.game).not.toBeOver();
                expect(context.p2Base.damage).toBe(19);
            });

            it('may target either base when both have 10 or less remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true },
                        base: { card: 'kestro-city', damage: 20 }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 20 }
                    }
                });

                const { context } = contextRef;

                // Move to the regroup phase, triggering the ability
                context.moveToRegroupPhase();

                // Both bases have 10 or less remaining HP, so both are legal targets, including the controller's own base
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // The chosen base is defeated, player1 wins the game
                expect(context.game).toBeOver();
                expect(context.player1).toBeGameWinner();
            });
        });

        describe('the control check for cards titled "Grand Moff Tarkin" (via The Tarkin Doctrine)', function() {
            it('fires while Grand Moff Tarkin is the undeployed leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                        hand: ['the-tarkin-doctrine#protect-and-punish']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to the base
                context.player1.clickCard(context.theTarkinDoctrine);
                expect(context.player1).toHavePrompt('Attach The Tarkin Doctrine to a base');
                context.player1.clickCard(context.p1Base);

                // The undeployed leader is titled "Grand Moff Tarkin", so the control check is satisfied
                expect(context.player1).toHavePrompt('Give an enemy unit -3/-0 for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // Wampa is debuffed for the phase
                expect(context.theTarkinDoctrine).toBeAttachedTo(context.p1Base);
                expect(context.wampa.getPower()).toBe(1);
            });

            it('does not fire once deployed as The Death Star', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true },
                        hand: ['the-tarkin-doctrine#protect-and-punish']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Attach The Tarkin Doctrine to the base. The deployed leader is now titled "The Death Star",
                // not "Grand Moff Tarkin", so the control check fails and no debuff target is offered.
                context.player1.clickCard(context.theTarkinDoctrine);
                context.player1.clickCard(context.p1Base);

                // No debuff target is offered, wampa is unaffected
                expect(context.theTarkinDoctrine).toBeAttachedTo(context.p1Base);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('the aspects provided by Grand Moff Tarkin', function() {
            it('undeployed leader provides Vigilance and Villainy', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                        base: 'lake-country',
                        hand: ['death-trooper'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Death Trooper must deal 2 damage to a friendly ground unit; it's the only friendly unit in play
                context.player1.clickCard(context.deathTrooper);

                // Vigilance/Villainy is provided by the undeployed leader, so no aspect penalty is paid
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('deployed unit side still provides Vigilance and Villainy', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true },
                        base: 'lake-country',
                        hand: ['death-trooper'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Death Trooper must deal 2 damage to a friendly ground unit; it's the only friendly unit in play
                context.player1.clickCard(context.deathTrooper);

                // Vigilance/Villainy is still provided by the deployed unit side, so no aspect penalty is paid
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });

        describe('the traits provided by Grand Moff Tarkin as a friendly leader (via C-3PO: Translation Protocol)', function() {
            it('on the leader side, only Imperial/Official units are eligible', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                        groundArena: ['c3po#translation-protocol', 'death-star-stormtrooper', 'coruscanti-spy', 'canyon-frontrunner', 'wampa'],
                        spaceArena: ['jedi-light-cruiser']
                    }
                });

                const { context } = contextRef;

                // Attack with C-3PO, triggering its On Attack ability
                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);

                // Undeployed leader traits are Imperial, Official; the Capital Ship (Jedi Light Cruiser) is not eligible
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.coruscantiSpy]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
            });

            it('on the deployed unit side, only Imperial/Vehicle/Capital Ship units are eligible', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true },
                        groundArena: ['c3po#translation-protocol', 'death-star-stormtrooper', 'coruscanti-spy', 'canyon-frontrunner', 'wampa'],
                        spaceArena: ['jedi-light-cruiser']
                    }
                });

                const { context } = contextRef;

                // Attack with C-3PO, triggering its On Attack ability
                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);

                // Deployed unit side traits are Imperial, Vehicle, Capital Ship: the Imperial trooper, the Vehicle,
                // and the Jedi Light Cruiser (Capital Ship) are eligible; the Official-only unit no longer is
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.canyonFrontrunner, context.jediLightCruiser]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
            });
        });
    });
});
