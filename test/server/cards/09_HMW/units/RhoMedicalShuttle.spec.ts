describe('Rho Medical Shuttle', function () {
    integration(function (contextRef) {
        describe('Rho Medical Shuttle\'s ability', function () {
            it('heals 1 damage from another unit or base when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rho-medical-shuttle'],
                        resources: 10,
                        spaceArena: [{ card: 'cartel-spacer', damage: 2 }],
                        base: { card: 'kestro-city', damage: 3 }
                    },
                    player2: {
                        base: { card: 'colossus', damage: 3 },
                        spaceArena: [{ card: 'awing', damage: 1 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rhoMedicalShuttle);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.awing, context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('heals 1 damage when it attacks', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'cartel-spacer', damage: 2 }, { card: 'rho-medical-shuttle', damage: 1 }],
                        base: { card: 'kestro-city', damage: 3 }
                    },
                    player2: {
                        base: { card: 'colossus', damage: 5 },
                        groundArena: [{ card: 'wampa', damage: 1 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rhoMedicalShuttle);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.p1Base, context.p2Base]);

                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
