describe('Wartime Trade Official', function () {
    integration(function (contextRef) {
        it('should create a Battle Droid token when defeated', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['wartime-trade-official'],
                },
                player2: {
                    leader: { card: 'mace-windu#vaapad-form-master', deployed: true },
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            context.player2.clickCard(context.maceWindu);
            context.player2.clickCard(context.wartimeTradeOfficial);
            const battleDroid = context.player1.findCardsByName('battle-droid');
            expect(battleDroid.length).toBe(1);
            expect(battleDroid[0]).toBeInZone('groundArena');
        });
    });
});