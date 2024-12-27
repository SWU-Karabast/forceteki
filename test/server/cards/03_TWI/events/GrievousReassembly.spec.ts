describe('Grievous Reassembly', function() {
    integration(function(contextRef) {
        describe('Grievous Reassembly\'s ability', function() {
            it('should heal 3 from a unit and create a Battle Droid token', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['grievous-reassembly'],
                        groundArena: [{ card: 'kanan-jarrus#revealed-jedi', damage: 4 }]
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grievousReassembly);
                expect(context.player1).toBeAbleToSelectExactly([context.kananJarrus, context.atst]);

                // Selects heal target
                context.player1.clickCard(context.kananJarrus);
                const battleDroids = context.player1.findCardsByName('battle-droid');

                // Validates healing
                expect(context.kananJarrus.remainingHp).toBe(4);

                // Validates Battle Droid token creation
                expect(battleDroids.length).toBe(1);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });

            it('should not heal a unit as there is no damage and create a Battle Droid token', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['grievous-reassembly'],
                        groundArena: ['fifth-brother#fear-hunter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grievousReassembly);
                expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother]);

                // Validates Battle Droid token creation
                context.player1.clickCard(context.fifthBrother);
                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
                expect(battleDroids).toAllBeInZone('groundArena');
            });
        });
    });
});
