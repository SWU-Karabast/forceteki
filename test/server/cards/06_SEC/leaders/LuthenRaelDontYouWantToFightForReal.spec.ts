describe('Luthen Rael, Don\'t You Want To Fight For Real?', function () {
    integration(function (contextRef) {
        describe('Luthen Rael\'s undeployed ability', function () {
            it('should exhaust himself to deal 1 damage to a unit or a base when a friendly unit is defeated while attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luthen-rael#dont-you-want-to-fight-for-real',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Defeat an enemy unit to trigger Luthen
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit or base');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context.wampa]);

                // Choose opponent base
                context.player1.clickCard(context.p2Base);

                // Effect applied and Luthen exhausted due to immediateEffect.exhaust()
                expect(context.p2Base.damage).toBe(1);
                expect(context.luthenRaelDontYouWantToFightForReal.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust himself to deal 1 damage to a unit or a base when a friendly unit is defeated while attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luthen-rael#dont-you-want-to-fight-for-real',
                        hand: ['heroic-sacrifice'],
                        groundArena: ['battlefield-marine']
                    },
                });

                const { context } = contextRef;

                // Defeat an enemy unit to trigger Luthen
                context.player1.clickCard(context.heroicSacrifice);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit or base');
                context.player1.clickPrompt('Trigger');

                // Choose opponent base
                context.player1.clickCard(context.p2Base);

                // Effect applied and Luthen exhausted due to immediateEffect.exhaust()
                expect(context.p2Base.damage).toBe(6); // 3+2+1
                expect(context.luthenRaelDontYouWantToFightForReal.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit is defeated while defending', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luthen-rael#dont-you-want-to-fight-for-real',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit is defeated by an event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luthen-rael#dont-you-want-to-fight-for-real',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['open-fire'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if a friendly unit is not defeated while attacking (defender not defeated)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luthen-rael#dont-you-want-to-fight-for-real',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toBeInZone('groundArena', context.player2);
            });

            it('should not trigger if a friendly unit is not defeated while attacking (defender defeated)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luthen-rael#dont-you-want-to-fight-for-real',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['porg'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('discard', context.player2);
            });
        });

        describe('Luthen Rael\'s deployed ability', function () {
            it('should optionally deal 2 damage to a unit or base when a friendly unit is defeated while attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luthen-rael#dont-you-want-to-fight-for-real', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Have your unit attack into a stronger defender and be defeated
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.luthenRael, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                // Choose opponent base to take 2 damage
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                // Deployed side does not exhaust per implementation
                expect(context.luthenRaelDontYouWantToFightForReal.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should optionally deal 2 damage to a unit or base when Luthen Rael is defeated while attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luthen-rael#dont-you-want-to-fight-for-real', deployed: true },
                    },
                    player2: {
                        groundArena: ['krayt-dragon']
                    }
                });

                const { context } = contextRef;

                // Have your unit attack into a stronger defender and be defeated
                context.player1.clickCard(context.luthenRael);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.kraytDragon]);
                expect(context.player1).toHavePassAbilityButton();

                // Choose opponent base to take 2 damage
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if unit is defeated while defending', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luthen-rael#dont-you-want-to-fight-for-real', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
            });
        });
    });
});
