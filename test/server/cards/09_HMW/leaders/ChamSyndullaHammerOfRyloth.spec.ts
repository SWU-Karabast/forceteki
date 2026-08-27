describe('Cham Syndulla, Hammer of Ryloth', function() {
    integration(function(contextRef) {
        describe('leader side ability', function() {
            const abilityPrompt = 'Exhaust this leader to deal 1 damage to an enemy unit or base';

            it('should let you exhaust the leader and deal 1 damage to an enemy unit when non-combat damage is dealt to a friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cham-syndulla#hammer-of-ryloth',
                        hand: ['open-fire'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);

                expect(context.player1).toHavePassAbilityPrompt(abilityPrompt);
                context.player1.clickPrompt('Trigger');

                expect(context.chamSyndulla.exhausted).toBeTrue();

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('should let you exhaust the leader and deal 1 damage to an enemy unit when non-combat damage is dealt to a friendly unit (enemy event)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cham-syndulla#hammer-of-ryloth',
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt(abilityPrompt);
                context.player1.clickPrompt('Trigger');

                expect(context.chamSyndulla.exhausted).toBeTrue();

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('should let you exhaust the leader and deal 1 damage to an enemy unit when non-combat damage is dealt to a friendly unit (enemy unit ability)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cham-syndulla#hammer-of-ryloth',
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['sabine-wren#explosives-artist', 'porg'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt(abilityPrompt);
                context.player1.clickPrompt('Trigger');

                expect(context.chamSyndulla.exhausted).toBeTrue();

                // nested trigger from sabine's on attack. she's still selectable
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sabineWren, context.porg]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should do nothing if the player passes the optional ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cham-syndulla#hammer-of-ryloth',
                        hand: ['open-fire'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt(abilityPrompt);
                context.player1.clickPrompt('Pass');

                expect(context.chamSyndulla.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger from combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cham-syndulla#hammer-of-ryloth',
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Wampa (4 power) deals combat damage to Battlefield Marine
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.chamSyndulla.exhausted).toBeFalse();
            });
        });

        describe('leader unit side ability', function() {
            const abilityPrompt = 'Deal 1 damage to an enemy unit or base';

            it('should deal 1 damage to an enemy base when non-combat damage is dealt to a friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cham-syndulla#hammer-of-ryloth', deployed: true },
                        hand: ['open-fire'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);

                expect(context.player1).toHavePrompt(abilityPrompt);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
            });

            it('should deal 1 damage to an enemy base when enemy event damage is dealt to a friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cham-syndulla#hammer-of-ryloth', deployed: true },
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['daring-raid'],
                        hasInitiative: true,
                        groundArena: ['porg']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.chamSyndulla);

                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.porg]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });

            it('should deal 1 damage to an enemy base when enemy unit ability damage is dealt to a friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cham-syndulla#hammer-of-ryloth', deployed: true },
                        groundArena: ['wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['sabine-wren#explosives-artist', 'porg'],
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.chamSyndulla);
                context.player2.clickCard(context.chamSyndulla);

                expect(context.player1).toHavePrompt(abilityPrompt);

                // nested trigger from sabine's on attack. she's still selectable
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sabineWren, context.porg]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
