describe('Protector', function() {
    integration(function(contextRef) {
        describe('Protector\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: [{ card: 'snowspeeder', upgrades: ['protector'] }]
                    }
                });
            });

            it('should be sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                // Snowspeeder automatically selected due to sentinel
                expect(context.player2).toBeActivePlayer();
                expect(context.snowspeeder.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInLocation('discard');
            });
        });
    });
});
