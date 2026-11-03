describe('Act of Aggression', function() {
    integration(function(contextRef) {
        describe('Act of Aggression\'s event ability', function() {
            it('should draw a card, deal 3 damage to a chosen unit, and give a friendly unit +3/+0 and Overwhelm for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        deck: ['pyke-sentinel', 'atst'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Play Act of Aggression, a card is drawn
                context.player1.clickCard(context.actOfAggression);
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
                expect(context.atst).toBeInZone('deck', context.player1);
                expect(context.player1.handSize).toBe(1);

                // Optional damage can target any unit, including deployed leaders
                expect(context.player1).toHavePrompt('Deal 3 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.lukeSkywalker,
                    context.wampa,
                    context.tielnFighter,
                    context.grandInquisitor
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                // Mandatory buff can only target friendly units, including the deployed leader
                expect(context.player1).toHavePrompt('Give a friendly unit +3/+0 and Overwhelm for this phase');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.lukeSkywalker
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(1);

                // Buffed Battlefield Marine (6 power) attacks the damaged Wampa (2 HP remaining), Overwhelm sends 4 excess damage to the base
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1); // took 4 damage from Wampa
            });

            it('should still draw a card and give the buff if the controller passes on dealing damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        deck: ['pyke-sentinel'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Act of Aggression, a card is drawn
                context.player1.clickCard(context.actOfAggression);
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);

                // Pass on the optional damage
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // The buff step is independent of the damage step and still resolves
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();

                // Buffed Battlefield Marine attacks the base
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the buff
            });

            it('should allow the same friendly unit to be damaged and then buffed if it survives the damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Damage the friendly Consular Security Force
                context.player1.clickCard(context.actOfAggression);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.pykeSentinel]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(3);

                // The damaged unit survived, so it is still a legal target for the buff
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();

                // Buffed unit (6 power) attacks Pyke Sentinel (3 HP), Overwhelm sends 3 excess damage to the base
                context.player2.passAction();
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(5); // 3 from the event + 2 from Pyke Sentinel
            });

            it('should not allow a friendly unit defeated by the damage to be buffed, and skip the buff if no other friendly unit exists', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Defeat the only friendly unit with the damage
                context.player1.clickCard(context.actOfAggression);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                // No friendly unit remains, so the buff step is skipped
                expect(context.player2).toBeActivePlayer();
            });

            it('should only offer the surviving friendly units for the buff when another friendly unit is defeated by the damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        groundArena: ['battlefield-marine', 'consular-security-force']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Defeat Battlefield Marine with the damage
                context.player1.clickCard(context.actOfAggression);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                // Only the surviving friendly unit can be buffed
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to deal damage to a deployed enemy leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Damage the deployed enemy leader
                context.player1.clickCard(context.actOfAggression);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.wampa,
                    context.grandInquisitor
                ]);
                context.player1.clickCard(context.grandInquisitor);
                expect(context.grandInquisitor.damage).toBe(3);
                expect(context.grandInquisitor).toBeInZone('groundArena', context.player2);

                // Buff Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to buff a friendly deployed leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Damage Pyke Sentinel
                context.player1.clickCard(context.actOfAggression);
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);

                // Buff the deployed leader
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker]);
                context.player1.clickCard(context.lukeSkywalker);

                // Luke attacks the base with 4 power + 3 from the buff
                context.player2.passAction();
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
            });

            it('should draw from an empty deck (3 damage to the base) and still resolve the damage and buff steps', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        deck: [],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Act of Aggression, drawing from an empty deck damages the base
                context.player1.clickCard(context.actOfAggression);
                expect(context.p1Base.damage).toBe(3);
                expect(context.player1.handSize).toBe(0);

                // Damage Wampa
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                // Buff Battlefield Marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                // Buffed Battlefield Marine attacks the base
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
            });

            it('should only draw a card when there are no units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Play Act of Aggression, only the draw resolves
                context.player1.clickCard(context.actOfAggression);
                expect(context.actOfAggression).toBeInZone('discard', context.player1);
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve the damage but skip the buff when only enemy units are in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        deck: ['pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Act of Aggression, a card is drawn
                context.player1.clickCard(context.actOfAggression);
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);

                // Damage Wampa
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                // No friendly unit to buff
                expect(context.player2).toBeActivePlayer();
            });

            it('should still allow buffing a Shielded friendly unit after the damage defeats its Shield', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Damage the Shielded Battlefield Marine
                context.player1.clickCard(context.actOfAggression);
                context.player1.clickCard(context.battlefieldMarine);

                // The Shield absorbs the damage and is defeated
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                // Buff Battlefield Marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                // Buffed Battlefield Marine attacks the base
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
            });
        });

        describe('Act of Aggression\'s buff duration', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['act-of-aggression'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Play Act of Aggression, pass on the damage and buff Battlefield Marine
                context.player1.clickCard(context.actOfAggression);
                context.player1.clickPrompt('Pass');
                context.player1.clickCard(context.battlefieldMarine);
            });

            it('should give +3/+0 and Overwhelm for the whole phase and not after the phase ends', function() {
                const { context } = contextRef;

                // First attack this phase: 6 power vs. Pyke Sentinel (3 HP) = 3 excess damage
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(3);
                expect(context.battlefieldMarine.damage).toBe(2);

                // Second attack in the same phase: still +3/+0 (no Pyke Sentinel remains, so attack the base directly)
                context.player2.passAction();
                context.readyCard(context.battlefieldMarine);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(9); // 3 + 6

                // The effect ends with the phase
                context.moveToNextActionPhase();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(12); // 9 + printed power of 3
            });

            it('should not grant Overwhelm after the phase ends', function() {
                const { context } = contextRef;

                // Move to the next phase, the effect has ended
                context.moveToNextActionPhase();

                // Printed 3 power vs. Pyke Sentinel (3 HP) is exactly lethal and has no Overwhelm, so no excess damage to the base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(0);
            });
        });
    });
});
