describe('Ty Yorrick, Monster Hunter', function() {
    integration(function(contextRef) {
        it('Ty Yorrick, Monster Hunter\'s on-attack ability should deal 1 damage to a Creature unit when attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ty-yorrick#monster-hunter', 'porg'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['mynock']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tyYorrickMonsterHunter);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.porg, context.mynock]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            // Constant ability triggering, pass it, will be tested in the damage modification test
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
        });

        describe('Ty Yorrick, Monster Hunter\'s damage modification', function() {
            it('should optionally increase friendly event ability damage by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should increase friendly event ability dealing damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.tyYorrick);

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.tyYorrick.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not increase enemy event ability dealing damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.tyYorrick);

                expect(context.player1).toBeActivePlayer();
                expect(context.tyYorrick.damage).toBe(2);
            });

            it('should optionally increase friendly unit ability damage by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tyYorrick);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should increase the total indirect damage dealt by a friendly ability by 1, even if distributed to multiple targets', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#hunting-the-rebellion'],
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.devastator);

                // the optional increase happens when the ability is initiated, before the damage is distributed
                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                // the total indirect damage is increased from 4 to 5 before being distributed
                expect(context.player1).toHavePrompt('Distribute 5 indirect damage among targets');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 4],
                    [context.wampa, 1],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
                expect(context.wampa.damage).toBe(1);
            });

            it('should increase the total damage a friendly ability distributes by 1 (Overwhelming Barrage)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overwhelming-barrage'],
                        groundArena: ['ty-yorrick#monster-hunter', 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst', 'porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.overwhelmingBarrage);
                context.player1.clickCard(context.wampa);

                // the optional increase happens when the "then" ability is initiated, before the damage is distributed
                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                // wampa has 4 power +2 from the event, +1 from Ty = distribute 7 total
                expect(context.player1).toHavePrompt('Distribute 7 damage among targets');
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.atst, 4],
                    [context.porg, 3],
                ]));

                expect(context.atst.damage).toBe(4);
                expect(context.porg).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not increase friendly Overwhelm damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter', 'wampa'],
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should optionally increase friendly ability damage by 1 (multiple time on a turn)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid']
                    },
                    player2: {
                        groundArena: ['mythosaur#folklore-awakened']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.mythosaur);

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.mythosaur.damage).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.tyYorrick);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.mythosaur);

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.mythosaur.damage).toBe(5);
            });

            it('should increase the damage of a friendly upgrade ability attached to an enemy unit (Grav Charge)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: [{ card: 'grav-charge', ownerAndController: 'player1' }] }],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                // grav charge is controlled by player1 even though it is attached to an enemy unit,
                // so its triggered ability is a friendly ability
                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.atst.damage).toBe(5);
                expect(context.gravCharge).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });

            it('may pass the damage increase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Pass');

                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should optionally increase the damage dealt to each target of a friendly ability by 1 (IG-2000)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ig2000#assassins-aggressor'],
                        groundArena: ['ty-yorrick#monster-hunter', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa', 'porg'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ig2000);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);
                context.player1.clickCard(context.yoda);
                context.player1.clickDone();

                // a single all-or-nothing prompt for the whole ability
                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa.damage).toBe(2);
                // porg only has 1 hp so it is defeated by the increased damage
                expect(context.porg).toBeInZone('discard');
                expect(context.yoda.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should optionally increase the damage dealt to each target of a friendly ability by 1 (IG-2000)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-sidious#there-is-no-mercy', deployed: true },
                        groundArena: ['ty-yorrick#monster-hunter', 'arena-nexu#starved-for-prey']
                    },
                });

                const { context } = contextRef;
                context.player1.clickCard(context.arenaNexu)
                context.player1.clickCard(context.p2Base)

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.arenaNexu)

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a different unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.tyYorrick, context.arenaNexu, context.p1Base, context.darthSidious]);
                context.player1.clickCard(context.p1Base)

                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.arenaNexu.damage).toBe(4)
                expect(context.arenaNexu.exhausted).toBeFalse();
                expect(context.p1Base.damage).toBe(2)
                expect(context.p2Base.damage).toBe(6)
            });
        });
    });
});