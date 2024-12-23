describe('Grievous Reassembly', function() {
    integration(function(contextRef) {
        describe('Grievous Reassembly\'s ability', function() {
            it('should heal 3 from a unit and create a Battle Droid token', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['grievous-reassembly'],
                        groundArena: [{ card: 'fifth-brother#fear-hunter', damage: 3 }]
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grievousReassembly);
                expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.atst]);

                // Selects heal target
                context.player1.clickCard(context.fifthBrother);
                const battleDroids = context.player1.findCardsByName('battle-droid');

                // Validates healing
                expect(context.fifthBrother.getHp()).toBe(4);

                // Validates Battle Droid token creation
                expect(battleDroids.length).toBe(1);
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

                context.player1.clickCard(context.fifthBrother);
                const battleDroids = context.player1.findCardsByName('battle-droid');

                // Validates Battle Droid token creation
                expect(battleDroids.length).toBe(1);
            });
        });
    });
});
