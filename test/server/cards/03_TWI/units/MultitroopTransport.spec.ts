describe('Multi-Troop Transport', function () {
    integration(function (contextRef) {
        it('Multi-Troop Transport\'s on-attack ability should create a Battle Droid token', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['multitroop-transport']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.multitroopTransport);
            context.player1.clickCard(context.p2Base);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(1);
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
