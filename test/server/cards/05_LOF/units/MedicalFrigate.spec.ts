describe('Medical Frigate', function() {
    integration(function(contextRef) {
        describe('Medical Frigate\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'battlefield-marine',
                            { card: 'r2d2#ignoring-protocol', damage: 3 },
                            { card: 'c3po#protocol-droid', damage: 1 }
                        ],
                        spaceArena: ['medical-frigate'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 2 }]
                    }
                });
            });

            it('should heal a target with 1 damage to full', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context.medicalFrigate);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.c3po);

                // Confirm Results
                expect(context.medicalFrigate.exhausted).toBe(true);
                expect(context.c3po.damage).toBe(0);
            });

            it('should heal 2 damage from a unit', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context.medicalFrigate);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.r2d2);

                // Confirm Results
                expect(context.medicalFrigate.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(1);
            });

            it('should be able to heal an enemy unit', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context.medicalFrigate);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.wampa.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                // Confirm Results
                expect(context.medicalFrigate.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(0);
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                expect(context.r2d2.damage).toBe(3);
                context.player1.clickCard(context.medicalFrigate);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Pass');
                expect(context.medicalFrigate.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(3);
            });
        });
    });
});
