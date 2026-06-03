describe('Shin Hati, Eager Adversary', function() {
    integration(function(contextRef) {
        describe('Leader side triggered ability', function() {
            it('should allow exhausting a unit that costs less than combat damage dealt to base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['awing'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust a unit that costs less than 2');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Exhaust a unit that costs less than 2');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.porg.exhausted).toBeTrue();
                expect(context.shinHati.exhausted).toBeTrue();
            });

            it('can exhaust an exhausted unit (or itself)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['awing'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
                expect(context.awing.exhausted).toBeTrue();
                expect(context.shinHati.exhausted).toBeTrue();
            });

            it('should not allow exhausting a unit when base is damaged by ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['awing'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.porg);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
                expect(context.shinHati.exhausted).toBeFalse();
            });

            it('should allow exhausting a unit that costs less than combat damage dealt to base (from overwhelm)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust a unit that costs less than 1');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
                expect(context.porg.exhausted).toBeTrue();
                expect(context.shinHati.exhausted).toBeTrue();
            });

            it('should not allow exhausting a unit when attack to base deal 0 damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['doctor-pershing#dedicated-to-research'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doctorPershing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.shinHati.exhausted).toBeFalse();
            });

            it('should not allow exhausting a unit when opponent attacks to base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['doctor-pershing#dedicated-to-research'],
                        spaceArena: ['awing'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.shinHati.exhausted).toBeFalse();
            });

            it('should allow exhausting a unit when a stolen enemy unit deals combat damage to base (even if he dies)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        leader: 'shin-hati#eager-adversary'
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }, 'porg', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust a unit that costs less than 3');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.shinHati.exhausted).toBeTrue();
            });
        });

        describe('Leader unit side triggered ability', function() {
            it('should allow exhausting a unit that costs less than combat damage dealt to base (once per turn)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['awing'],
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shinHati);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Exhaust a unit that costs less than 4');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing, context.sabineWren, context.yoda, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
                expect(context.yoda.exhausted).toBeTrue();

                context.player2.passAction();

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Exhaust a unit that costs less than 2');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg.exhausted).toBeTrue();
            });

            it('should allow exhausting a unit that costs less than combat damage dealt to base (from overwhelm)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player1).toHavePrompt('Exhaust a unit that costs less than 3');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });

            it('should not allow exhausting a unit when damage is not dealt to base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shinHati);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow exhausting a unit when opponent attacks to base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['synara-san#harboring-a-secret'],
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.synaraSan);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.shinHati.exhausted).toBeFalse();
            });

            it('can be pass and reused later this round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', { card: 'yoda#old-master', upgrades: ['kylo-rens-lightsaber'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing]);
                context.player1.clickPrompt('Pass');

                context.player2.passAction();

                context.player1.clickCard(context.shinHati);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.battlefieldMarine, context.yoda, context.awing]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.exhausted).toBeFalse();

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow exhausting a unit when a stolen enemy unit deals combat damage to base (even if he dies)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }, 'porg', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });
        });
    });
});
