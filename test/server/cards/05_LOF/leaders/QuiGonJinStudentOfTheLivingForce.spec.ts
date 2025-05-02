
describe('Qui-Gon Jinn, Student of the Living Force', function() {
    integration(function (contextRef) {
        describe('Qui-Gon Jinn\'s Leader side ability', function () {
            it('should not be able to return enemy units and should be able to pay costs to exhaust Quigon', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        resources: 5
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
            });

            it('should be able to return a unit to hand even if there is no valid card to play afterward', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        resources: 5,
                        hand: ['wampa'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.battlefieldMarine).toBeInZone('hand');
            });

            it('should not be able to play a Villainy unit that costs less than the returned unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        resources: 5,
                        groundArena: ['wampa'],
                        hand: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.wampa).toBeInZone('hand');
            });

            it('should be able to play a non-Villainy unit that costs less than the returned unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        resources: 5,
                        groundArena: ['wampa'],
                        hand: ['battlefield-marine', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);

                context.player1.clickCard(context.quigonJinn);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
            });

            it('should be be able to return a stolen unit to the opponent\'s hand and then play a unit from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'quigon-jinn#student-of-the-living-force',
                        hasForceToken: true,
                        hand: ['change-of-heart', 'battlefield-marine', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickPrompt('Return a friendly unit to hand');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand', context.player2);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6); // Change of Heart

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
            });
        });

        describe('Qui-Gon Jinn\'s deployed ability', function () {
            it('should not be able to return and play a unit if he dies in the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'quigon-jinn#student-of-the-living-force', deployed: true, damage: 6 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.quigonJinn).toBeInZone('base');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to return and play a unit if there are no friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'quigon-jinn#student-of-the-living-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.p2Base);
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to return a unit to hand even if there is no valid card to play afterward', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'quigon-jinn#student-of-the-living-force', deployed: true },
                        hand: ['wampa'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.battlefieldMarine).toBeInZone('hand');
            });

            it('should not be able to play a Villainy unit that costs less than the returned unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'quigon-jinn#student-of-the-living-force', deployed: true },
                        groundArena: ['wampa'],
                        hand: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
                expect(context.wampa).toBeInZone('hand');
            });

            it('should be able to play a non-Villainy unit that costs less than the returned unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'quigon-jinn#student-of-the-living-force', deployed: true },
                        groundArena: ['wampa'],
                        hand: ['battlefield-marine', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
            });

            it('should be be able to return a stolen unit to the opponent\'s hand and then play a unit from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'quigon-jinn#student-of-the-living-force', deployed: true },
                        hand: ['change-of-heart', 'battlefield-marine', 'moisture-farmer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.quigonJinn);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand', context.player2);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6); // Change of Heart

                expect(context.player2).toBeActivePlayer();
                expect(context.quigonJinn.exhausted).toBe(true);
            });
        });
    });
});
