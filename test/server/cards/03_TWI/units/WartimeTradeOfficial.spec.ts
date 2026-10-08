describe('Wartime Trade Official', function () {
    integration(function (contextRef) {
        it('should create a Battle Droid token when defeated', async function () {
            await contextRef.setupTestAsync({
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

        it('should create the Battle Droid token for the opponent when defeated with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wartime-trade-official'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.wartimeTradeOfficial);

            expect(context.wartimeTradeOfficial).toBeInZone('discard', context.player1);
            expect(context.player1.findCardsByName('battle-droid').length).toBe(0);

            const battleDroid = context.player2.findCardsByName('battle-droid');
            expect(battleDroid.length).toBe(1);
            expect(battleDroid[0]).toBeInZone('groundArena', context.player2);
            expect(context.player1).toBeActivePlayer();
        });
    });
});