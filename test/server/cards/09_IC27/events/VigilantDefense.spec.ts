describe('Vigilant Defense', function() {
    integration(function(contextRef) {
        describe('Vigilant Defense\'s event ability', function() {
            it('should give a friendly unit +0/+3 and Sentinel, heal 3 damage from a friendly unit or base, and defeat an enemy unit with 3 or less remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        base: { card: 'echo-base', damage: 5 },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        groundArena: [
                            { card: 'wampa', damage: 2 },
                            { card: 'consular-security-force', damage: 3 }
                        ],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Buff: any friendly unit, including the deployed leader, and it is mandatory
                context.player1.clickCard(context.vigilantDefense);
                expect(context.player1).toHavePrompt('Give a friendly unit +0/+3 and Sentinel for this phase');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.lukeSkywalker
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(6);
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeTrue();

                // Heal: friendly units and the friendly base only, and it is mandatory
                expect(context.player1).toHavePrompt('Heal 3 damage from a friendly unit or base');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.lukeSkywalker,
                    context.p1Base
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Defeat: only enemy units with 3 or less remaining HP
                // (Wampa has 3, TIE/ln has 1, Consular Security Force has 4, the undamaged Grand Inquisitor has more)
                expect(context.player1).toHavePrompt('Defeat an enemy unit with 3 or less remaining HP');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.vigilantDefense).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow healing the unit that was just given +0/+3', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: [{ card: 'consular-security-force', damage: 5 }]
                    },
                    player2: {
                        groundArena: ['vanguard-infantry']
                    }
                });

                const { context } = contextRef;

                // Buff Consular Security Force (7 HP -> 10 HP)
                context.player1.clickCard(context.vigilantDefense);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.getHp()).toBe(10);

                // Heal the same unit
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.p1Base]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.consularSecurityForce.remainingHp).toBe(8);

                // Defeat Vanguard Infantry
                expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry]);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.vanguardInfantry).toBeInZone('discard', context.player2);

                // Vanguard Infantry's When Defeated triggers for its controller
                expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the +0/+3 keep a damaged unit alive', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Buff Battlefield Marine (3 HP -> 6 HP), skip healing it
                context.player1.clickCard(context.vigilantDefense);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p1Base);

                // No enemy unit has 3 or less remaining HP, so the defeat step is skipped
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();

                // Wampa attacks the Sentinel Battlefield Marine for 4, which would have defeated it without the buff
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine.damage).toBe(5);
            });

            it('should skip the buff and still heal the base and defeat an enemy unit when there are no friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // No friendly unit, so the heal is the first prompt and only the base can be chosen
                context.player1.clickCard(context.vigilantDefense);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Defeat Battlefield Marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should skip the heal when no friendly unit or base is damaged and still defeat an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        base: { card: 'echo-base', damage: 5 },
                        groundArena: [{ card: 'wampa', damage: 3 }],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Buff Battlefield Marine
                context.player1.clickCard(context.vigilantDefense);
                context.player1.clickCard(context.battlefieldMarine);

                // Nothing friendly is damaged (enemy base and Wampa can't be healed), so the defeat step is next
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(5);
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to defeat an enemy deployed leader unit with 3 or less remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 3 }
                    }
                });

                const { context } = contextRef;

                // Buff Battlefield Marine, nothing to heal
                context.player1.clickCard(context.vigilantDefense);
                context.player1.clickCard(context.battlefieldMarine);

                // Defeat the deployed Grand Inquisitor (6 HP, 3 damage)
                expect(context.player1).toBeAbleToSelectExactly([context.grandInquisitor]);
                context.player1.clickCard(context.grandInquisitor);
                expect(context.grandInquisitor).toBeInZone('base', context.player2);
                expect(context.grandInquisitor.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit with 3 or less remaining HP even if it has a Shield', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 2, upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                // Buff Battlefield Marine, nothing to heal
                context.player1.clickCard(context.vigilantDefense);
                context.player1.clickCard(context.battlefieldMarine);

                // The Shield does not prevent the defeat
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only heal a damaged base when there are no units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        base: { card: 'echo-base', damage: 2 }
                    }
                });

                const { context } = contextRef;

                // Only the damaged base can be healed, no units to buff or defeat
                context.player1.clickCard(context.vigilantDefense);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
                expect(context.vigilantDefense).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve with no effect when there are no units in play and nothing to heal', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense']
                    }
                });

                const { context } = contextRef;

                // Play the event, nothing to buff, heal or defeat
                context.player1.clickCard(context.vigilantDefense);
                expect(context.vigilantDefense).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not affect attacks in the other arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: ['millennium-falcon#piece-of-junk']
                    }
                });

                const { context } = contextRef;

                // Buff Battlefield Marine (ground), nothing to heal or defeat
                context.player1.clickCard(context.vigilantDefense);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                // Space attacks can still target the base or the space unit
                context.player2.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);
            });
        });

        describe('Vigilant Defense\'s Sentinel and HP bonus', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilant-defense'],
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Buff Battlefield Marine, nothing to heal, defeat the TIE/ln (1 HP)
                context.player1.clickCard(context.vigilantDefense);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.player2).toBeActivePlayer();
            });

            it('should force enemy ground attacks onto the buffed unit for this phase', function() {
                const { context } = contextRef;

                // Wampa can only attack the Sentinel Battlefield Marine
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(4);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                // Still Sentinel later in the phase
                context.player1.passAction();
                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            });

            it('should end the +0/+3 and Sentinel when the phase ends', function() {
                const { context } = contextRef;

                // Move to the next phase, the buff has expired
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getHp()).toBe(3);
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeFalse();

                // Wampa can attack any friendly ground unit or the base again
                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.p1Base
                ]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});
