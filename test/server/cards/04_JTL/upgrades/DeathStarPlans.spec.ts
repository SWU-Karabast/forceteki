describe('Death Star Plans', function () {
    integration(function (contextRef) {
        describe('attached gain ability', function () {
            it('should reduce the cost of the first unit played by 2', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }],
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should not reduce the cost of the second unit played by 2', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        base: 'kestro-city',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }],
                        hand: ['wampa', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                context.player2.passAction();
                context.player1.clickCard(context.moistureFarmer);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should not reduce the cost of the first enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }]
                    },
                    player2: {
                        base: 'kestro-city',
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2.exhaustedResourceCount).toBe(4);
            });

            it('should reduce the cost of the first unit played and then again for the other player when the attached unit is taken control of', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dagobah-swamp',
                        hand: ['moisture-farmer'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }]
                    },
                    player2: {
                        base: 'kestro-city',
                        hand: ['wampa', 'change-of-heart']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.moistureFarmer);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.battlefieldMarine);
                context.player1.passAction();

                const p2ResourcesBefore = context.player2.readyResourceCount;
                context.player2.clickCard(context.wampa);
                expect(context.player2.exhaustedResourceCount).toBe(p2ResourcesBefore - 2);
            });

            it('should switch controllers when the attached unit is attacked and be moved to a new friendly target', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }]
                    },
                    player2: {
                        groundArena: ['warrior-drone', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.warriorDrone);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.warriorDrone]);
                context.player2.clickCard(context.wampa);
                expect(context.deathStarPlans).toBeAttachedTo(context.wampa);
                expect(context.deathStarPlans.controller).toBe(context.player2.player);
            });

            it('should reduce the cost of the first unit played and then again for the other player when Death Star Plans switches control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['partisan-insurgent'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }]
                    },
                    player2: {
                        hand: ['volunteer-soldier'],
                        groundArena: ['warrior-drone', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.partisanInsurgent);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.clickCard(context.warriorDrone);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);

                context.player1.passAction();
                context.player2.clickCard(context.volunteerSoldier);
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });

            it('should not reduce the cost of the first unit played and by a player who has already used Death Star Plans before it switched control twice', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        base: 'kestro-city',
                        hand: ['partisan-insurgent', 'moisture-farmer'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }, 'cantina-braggart']
                    },
                    player2: {
                        hand: ['volunteer-soldier'],
                        groundArena: ['warrior-drone', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.partisanInsurgent);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // Attack and move DSP to Wampa
                context.player2.clickCard(context.warriorDrone);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);

                // Attack and move DSP back to Battlefield Marine
                context.player1.clickCard(context.cantinaBraggart);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                const p1ResourcesBefore = context.player1.readyResourceCount;
                context.player2.passAction();
                context.player1.clickCard(context.moistureFarmer);
                expect(context.player1.readyResourceCount).toBe(p1ResourcesBefore - 1);
            });

            it('should not reduce the cost of the first unit played after taking control of Death Star Plans if it is not the first unit of the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['partisan-insurgent'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['death-star-plans'] }]
                    },
                    player2: {
                        hand: ['volunteer-soldier', 'moisture-farmer'],
                        groundArena: ['warrior-drone', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.moistureFarmer);
                context.player1.passAction();

                context.player2.clickCard(context.warriorDrone);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);

                context.player1.passAction();
                context.player2.clickCard(context.volunteerSoldier);
                expect(context.player2.exhaustedResourceCount).toBe(4);
            });
        });
    });
});