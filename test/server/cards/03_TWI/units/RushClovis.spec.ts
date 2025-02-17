describe('Rush Clovis\'s ability', function () {
    integration(function (contextRef) {
        it('should create a Battle Droid token if the opponent has no ready resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['rush-clovis#banking-clan-scion'],
                    resources: 5
                },
                player2: {
                    groundArena: ['rush-clovis#banking-clan-scion'],
                    resources: 1
                }
            });
            const { context } = contextRef;
            const rushClovisP1 = context.player1.findCardByName('rush-clovis#banking-clan-scion');
            const rushClovisP2 = context.player2.findCardByName('rush-clovis#banking-clan-scion');

            // Check player 1 doesn't get a Battle Droid token since player 2 has ready resources.
            context.player1.clickCard(rushClovisP1);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.findCardsByName('battle-droid').length).toBe(0);

            // Check player 2 gets a Battle Droid token since player 1 has no ready resources.
            context.player1.exhaustResources(5);
            context.player2.clickCard(rushClovisP2);
            context.player2.clickCard(context.p1Base);
            expect(context.player2.findCardsByName('battle-droid').length).toBe(1);
        });
    });
});