describe('C-3PO, Human-Cyborg Relations', function() {
    integration(function(contextRef) {
        describe('C-3PO\'s Leader side ability', function() {
            it('pays 1 resource, exhausts C-3PO, and exhausts the chosen friendly unit if you already control an exhausted unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'c3po#humancyborg-relations',
                        resources: 2,
                        groundArena: ['atst', { card: 'wampa', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
                const { context } = contextRef;

                // Use C-3PO's action ability and target AT-ST
                context.player1.clickCard(context.c3po);
                // With a single action ability, it should immediately go to target selection
                context.player1.clickCard(context.atst);

                // Costs are paid
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.c3po.exhausted).toBeTrue();

                // Because player1 already had an exhausted unit (wampa), the chosen unit gets exhausted
                expect(context.atst.exhausted).toBeTrue();
            });

            it('pays 1 resource and exhausts C-3PO but does not exhaust the target if you control no exhausted units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'c3po#humancyborg-relations',
                        resources: 2,
                        groundArena: ['atst', 'pirate-battle-tank']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.atst.exhausted).toBeFalse();
                expect(context.pirateBattleTank.exhausted).toBeFalse();
                expect(context.sundariPeacekeeper.exhausted).toBeFalse();

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.c3po.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('C-3PO\'s Unit side on-attack ability', function() {
            it('after C-3PO attacks, may exhaust another friendly unit if you already control an exhausted unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'c3po#humancyborg-relations', deployed: true },
                        groundArena: ['death-trooper', { card: 'seasoned-shoretrooper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
                const { context } = contextRef;

                // Attack with C-3PO
                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.c3po, context.seasonedShoretrooper, context.sundariPeacekeeper]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.deathTrooper);

                expect(context.deathTrooper.exhausted).toBeTrue();
                expect(context.sundariPeacekeeper.exhausted).toBeFalse();

                // Turn should pass to player 2 afterward (attack resolved and optional ability resolved)
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot exhaust unit if you do not control another exhausted unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'c3po#humancyborg-relations', deployed: true },
                        groundArena: ['death-trooper', 'wampa']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
                const { context } = contextRef;

                // Attack with C-3PO
                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);

                expect(context.deathTrooper.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.sundariPeacekeeper.exhausted).toBeFalse();

                // Turn should pass to player 2 afterward (attack resolved and optional ability resolved)
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust another unit if we trigger C3PO attacks from a unit\'s ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'c3po#humancyborg-relations', deployed: true },
                        groundArena: ['death-trooper', 'babu-frik#heyyy']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });
                const { context } = contextRef;

                // Attack with C-3PO
                context.player1.clickCard(context.babuFrik);
                context.player1.clickPrompt('Attack with a friendly Droid unit. For this attack, it deals damage equal to its remaining HP instead of its power.');
                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.babuFrik, context.c3po, context.sundariPeacekeeper]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.deathTrooper);

                expect(context.deathTrooper.exhausted).toBeTrue();
                expect(context.sundariPeacekeeper.exhausted).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
