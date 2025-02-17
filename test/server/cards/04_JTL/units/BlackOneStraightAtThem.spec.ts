describe('Black One, Straight At Them', function() {
    integration(function(contextRef) {
        describe('Black One\'s ability', function() {
            it('should not get +1/0 because the unit is not upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['black-one#straight-at-them']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blackOne);
                context.player1.clickCard(context.p2Base);

                expect(context.blackOne.getPower()).toBe(2);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should get +1/0 because the unit is upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'black-one#straight-at-them', upgrades: ['top-target'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blackOne);
                context.player1.clickCard(context.p2Base);

                expect(context.blackOne.getPower()).toBe(3);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});