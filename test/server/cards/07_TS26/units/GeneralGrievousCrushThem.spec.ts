describe('General Grievous, Crush Them!', function () {
    integration(function (contextRef) {
        describe('General Grievous\'s abilities', function () {
            it('should get +1/+1 for each resource controlled', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: 4,
                        groundArena: [{ card: 'general-grievous#crush-them', damage: 1 }, 'superlaser-technician'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                expect(context.generalGrievous.getPower()).toBe(4);
                expect(context.generalGrievous.getHp()).toBe(4);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.superlaserTechnician);
                // put slt on resource
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.generalGrievous.getPower()).toBe(5);
                expect(context.generalGrievous.getHp()).toBe(5);
            });

            it('should gain Sentinel while undamaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#crush-them'],
                        resources: 10
                    },
                    player2: {
                        groundArena: ['atst', 'wampa'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.generalGrievous]);
                context.player2.clickCard(context.generalGrievous);

                expect(context.generalGrievous.damage).toBe(6);
                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.generalGrievous, context.p1Base]);

                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(4);
            });

            it('should die immediately if losing his ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#crush-them'],
                        resources: 10
                    },
                    player2: {
                        hand: ['imprisoned'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.imprisoned);
                context.player2.clickCard(context.generalGrievous);

                expect(context.player1).toBeActivePlayer();
                expect(context.generalGrievous).toBeInZone('discard', context.player1);
                expect(context.imprisoned).toBeInZone('discard', context.player2);
            });
        });
    });
});
