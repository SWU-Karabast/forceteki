describe('Obi-Wan Kenobi, Patient Mentor', function () {
    integration(function (contextRef) {
        describe('Obi-Wan Kenobi\'s leader undeployed  ability', function () {
            it('should heal 1 damage from unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', damage: 2 },
                            'wampa'
                        ],
                        leader: 'obiwan-kenobi#patient-mentor',
                        resources: 3,
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 2 }],
                        base: { card: 'echo-base', damage: 2 }
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(1);
            });
        });

        describe('Obi-Wan Kenobi\'s leader deployed ability', function () {
            it('should heal 1 damage from a unit and if we do, deal 1 damage to a different unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', damage: 2 },
                            'wampa'
                        ],
                        leader: { card: 'obiwan-kenobi#patient-mentor', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 2 }],
                        base: { card: 'echo-base', damage: 2 }
                    },
                });

                const { context } = contextRef;

                function reset() {
                    context.obiwanKenobi.exhausted = false;
                    context.setDamage(context.p2Base, 0);
                    context.player2.passAction();
                }

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst, context.wampa, context.battlefieldMarine]);

                // choose a unit with no damage, should not do the "if you do" ability
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(6);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(2);

                reset();

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst, context.wampa, context.battlefieldMarine]);

                // choose a unit to heal
                context.player1.clickCard(context.battlefieldMarine);

                // choose another unit to deal 1 damage
                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst, context.wampa]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(4);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.atst.damage).toBe(3);
            });
        });
    });
});
