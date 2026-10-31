describe('Confederate Courier', function () {
    integration(function (contextRef) {
        it('Confederate Courier\'s ability should create a Battle Droid token when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    spaceArena: ['confederate-courier']
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.confederateCourier);
            const battleDroid = context.player2.findCardsByName('battle-droid');
            expect(battleDroid.length).toBe(1);
            expect(battleDroid[0]).toBeInZone('groundArena');
        });

        it('Confederate Courier\'s ability should create the Battle Droid token for the opponent when defeated with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['confederate-courier']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                },
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.confederateCourier);

            expect(context.confederateCourier).toBeInZone('discard', context.player1);
            expect(context.player1.findCardsByName('battle-droid').length).toBe(0);

            const battleDroid = context.player2.findCardsByName('battle-droid');
            expect(battleDroid.length).toBe(1);
            expect(battleDroid[0]).toBeInZone('groundArena', context.player2);
            expect(context.player1).toBeActivePlayer();
        });
    });
});