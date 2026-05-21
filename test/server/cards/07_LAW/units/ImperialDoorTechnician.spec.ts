describe('Imperial Door Technician', function() {
    integration(function(contextRef) {
        describe('Imperial Door Technician\'s ability', function() {
            it('should heal 2 damage from our base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['imperial-door-technician'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.imperialDoorTechnician);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should heal 2 damage from our base (No Glory Only Results)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['imperial-door-technician'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        hasInitiative: true,
                        base: { card: 'echo-base', damage: 5 }
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.imperialDoorTechnician);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
