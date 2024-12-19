describe('Confederate Courier', function () {
    integration(function (contextRef) {
        describe('ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        spaceArena: ['confederate-courier']
                    },
                });
            });

            it('should create a Battle Droid token when defeated', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.confederateCourier);
                const battleDroid = context.player2.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });
        });
    });
});