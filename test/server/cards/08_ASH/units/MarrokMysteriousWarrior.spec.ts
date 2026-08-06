describe('Marrok, Mysterious Warrior', function() {
    integration(function(contextRef) {
        describe('Marrok\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'marrok#mysterious-warrior', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'crafty-smuggler', 'battlefield-marine'],
                        hasInitiative: true,
                    },
                });
            });

            it('should lose Senitinel while upgraded and gain Saboteur', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.pykeSentinel);
                expect(context.player2).toBeAbleToSelectExactly([context.marrok, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                context.player1.clickCard(context.marrok);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.craftySmuggler, context.battlefieldMarine, context.p2Base]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.craftySmuggler);

                expect(context.player2).toBeAbleToSelectExactly([context.marrok]);
                context.player2.clickCard(context.marrok);

                expect(context.marrok.damage).toBe(2);
                expect(context.craftySmuggler).toBeInZone('discard', context.player2);
            });
        });
    });
});