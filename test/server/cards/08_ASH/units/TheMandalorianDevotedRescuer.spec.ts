describe('The Mandalorian, Devoted Rescuer', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            it('should defeat a shield on The Mandalorian to prevent combat damage to another friendly unit (unit is defender)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                // Shield is auto-selected and defeated — no card selection prompt shown
                const [shield] = context.player1.findCardsByName('shield');
                expect(shield).toBeInZone('outsideTheGame');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.theMandalorian.damage).toBe(0);
                expect(context.wampa.damage).toBe(3); // combat damage still dealt back to attacker
            });

            it('should defeat a shield on The Mandalorian to prevent combat damage to another friendly unit (unit is attacker)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                // Shield is auto-selected and defeated — no card selection prompt shown
                const [shield] = context.player1.findCardsByName('shield');
                expect(shield).toBeInZone('outsideTheGame');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(3);
            });

            it('should defeat a shield to prevent event damage to another friendly unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                // Shield is auto-selected and defeated — no card selection prompt shown
                const [shield] = context.player1.findCardsByName('shield');
                expect(shield).toBeInZone('outsideTheGame');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow passing — unit then takes full damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.theMandalorian).toHaveExactUpgradeNames(['shield']); // shield not spent
            });

            it('should not trigger when The Mandalorian himself is attacked — his own shield handles it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }],
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.theMandalorian);

                // Shield fires automatically (not optional) — no prompt shown
                // Mando's own ability does NOT trigger (shouldCardHaveDamageModification false for self)
                const [shield] = context.player1.findCardsByName('shield');
                expect(shield).toBeInZone('outsideTheGame');
                expect(context.theMandalorian.damage).toBe(0);
                expect(context.player1).toBeActivePlayer(); // player2 used their action
            });

            it('should not trigger when another unit has a shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-mandalorian#devoted-rescuer', 'wampa', { card: 'pyke-sentinel', upgrades: ['shield'] }],
                    },
                    player2: {
                        hand: ['open-fire'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer(); // player2 used their action

                // Deal damage to a friendly unit while Mando doesnt have a shield but another friendly unit does
                expect(context.wampa.damage).toBe(4);
            });

            it('should not trigger when The Mandalorian has no shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-mandalorian#devoted-rescuer', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.battlefieldMarine);

                // No valid shield to defeat — ability does not prompt
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer(); // player2 used their action
            });

            it('should auto-remove one shield when The Mandalorian has multiple shields', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield', 'shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickPrompt('Trigger');

                // Shield is auto-selected — no card selection prompt shown
                expect(context.theMandalorian).toHaveExactUpgradeNames(['shield']); // exactly one shield remains
                expect(context.battlefieldMarine.damage).toBe(0);
            });

            it('should prefer the highPriorityRemoval (Jetpack) shield when auto-selecting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jetpack'],
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['open-fire'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player1 plays Jetpack on Mando — this immediately creates a highPriorityRemoval shield
                context.player1.clickCard(context.jetpack);
                context.player1.clickCard(context.theMandalorian);

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                // The Jetpack shield (highPriorityRemoval) is auto-selected over the regular shield
                const shields = context.theMandalorian.upgrades.filter((s) => s.isShield());
                expect(shields.length).toBe(1);
                expect(shields[0].highPriorityRemoval).toBeFalse();
                expect(context.battlefieldMarine.damage).toBe(0);
            });

            it('should not trigger for base damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // Base is not a unit — ability does not trigger
                expect(context.p1Base.damage).toBe(4);
                expect(context.theMandalorian).toHaveExactUpgradeNames(['shield']); // shield untouched
                expect(context.player1).toBeActivePlayer(); // player2 used their action
            });

            it('should not trigger when an enemy unit is damaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);

                // Wampa is an enemy unit — ability does not trigger, shield untouched
                expect(context.theMandalorian).toHaveExactUpgradeNames(['shield']);
                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only protect one unit when multiple friendly units in the same arena are damaged simultaneously', async function () {
                // Turbolaser Salvo deals damage to all units in the chosen arena simultaneously.
                // Mando's ability can only sacrifice one shield per use, so it should only protect
                // one unit — not all units in the arena.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] },
                            'battlefield-marine',
                            'wampa'
                        ],
                    },
                    player2: {
                        hand: ['turbolaser-salvo'],
                        spaceArena: ['concord-dawn-interceptors'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Concord Dawn Interceptors has power 1, so each ground unit takes 1 damage.
                context.player2.clickCard(context.turbolaserSalvo);
                context.player2.clickPrompt('Ground');
                context.player2.clickCard(context.concordDawnInterceptors);

                // Three triggers: Shield token for Mando, Mando's ability for BFM, Mando's ability for Wampa.
                // Player resolves Mando's ability for Battlefield Marine first (auto-defeating the shield).
                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                context.player1.clickPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Battlefield Marine: Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                // Shield is auto-selected and defeated — no card selection prompt shown.
                // With no shield remaining, all other triggers are automatically cleared.
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should protect two units when Mando has two shields and multiple friendly units are damaged simultaneously', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield', 'shield'] },
                            'battlefield-marine',
                            'wampa'
                        ],
                    },
                    player2: {
                        hand: ['turbolaser-salvo'],
                        spaceArena: ['concord-dawn-interceptors'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.turbolaserSalvo);
                context.player2.clickPrompt('Ground');
                context.player2.clickCard(context.concordDawnInterceptors);

                // Resolve Mando's ability for BFM — auto-defeats first shield
                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                context.player1.clickPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Battlefield Marine: Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                // One shield remains — Mando's ability for Wampa is still valid
                context.player1.clickPrompt('Defeat a Shield attached to The Mandalorian to prevent all damage to Wampa: Wampa');
                context.player1.clickPrompt('Trigger');

                // Both shields consumed — Mando takes 1 damage, BFM and Wampa protected
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.theMandalorian.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not prevent indirect damage even when shield is defeated — indirect damage bypasses prevention', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#devoted-rescuer', upgrades: ['shield'] }, 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['torpedo-barrage'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                // Distribute 3 to battlefield-marine (exactly its HP) and 2 to base
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.battlefieldMarine, 3],
                    [context.p1Base, 2],
                ]));

                // Ability fires for the indirect damage to battlefield-marine but damage still goes through
                context.player1.clickPrompt('Trigger');

                // Shield is auto-selected and defeated — no card selection prompt shown
                const [shield] = context.player1.findCardsByName('shield');
                expect(shield).toBeInZone('outsideTheGame');
                expect(context.battlefieldMarine).toBeInZone('discard'); // indirect damage not prevented
                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});
