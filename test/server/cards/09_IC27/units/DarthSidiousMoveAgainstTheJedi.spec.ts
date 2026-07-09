describe('Darth Sidious, Move Against the Jedi', function() {
    integration(function(contextRef) {
        describe('Sidious\'s heal-triggered ability', function() {
            it('deals damage equal to the amount healed when he attacks and heals via Restore', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.p2Base);

                // Restore 3 heals 3 from base, which triggers the deal-damage ability
                expect(context.player1).toHavePrompt('Deal 3 damage to an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);
                context.player1.clickCard(context.wampa);

                expect(context.p1Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(3);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('deals only the amount actually healed when the base has less damage than the Restore value', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 1 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.p2Base);

                // Restore 3 can only heal the 1 damage present, so the prompt reflects only 1 damage
                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
                context.player1.clickCard(context.wampa);

                expect(context.p1Base.damage).toBe(0);
                expect(context.wampa.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when the base is undamaged and nothing is healed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 0 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('triggers off base healing from a different source', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#move-against-the-jedi', 'village-tender'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Village Tender's Restore 1 heals the base, which triggers Sidious's ability
                context.player1.clickCard(context.villageTender);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
                context.player1.clickCard(context.wampa);

                expect(context.p1Base.damage).toBe(4);
                expect(context.wampa.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('resolves with no effect when a heal occurs but there is no enemy unit to damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.p2Base);

                // Base is still healed and Sidious deals combat damage; the ability just has no legal target
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('triggers off a "heal up to" effect, dealing the amount actually healed from the base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['redemption#medical-frigate'],
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Redemption's "Heal up to 8" heals 3 from our base, triggering Sidious
                context.player1.clickCard(context.redemption);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.p1Base, 3]
                ]));

                expect(context.player1).toHavePrompt('Deal 3 damage to an enemy unit');
                context.player1.clickCard(context.wampa);

                expect(context.p1Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when we heal the enemy base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['redemption#medical-frigate'],
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        base: { card: 'administrators-tower', damage: 5 }
                    }
                });

                const { context } = contextRef;

                // Heal only the enemy base — "your base" is not affected, so Sidious does not trigger
                context.player1.clickCard(context.redemption);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.p2Base, 3]
                ]));

                expect(context.p2Base.damage).toBe(2);
                expect(context.p1Base.damage).toBe(5);
                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when an enemy ability heals our base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#move-against-the-jedi'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['redemption#medical-frigate'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // The opponent heals our base — it is not "you" (Sidious's controller) healing, so no trigger
                context.player2.clickCard(context.redemption);
                context.player2.setDistributeHealingPromptState(new Map([
                    [context.p1Base, 3]
                ]));

                expect(context.p1Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
