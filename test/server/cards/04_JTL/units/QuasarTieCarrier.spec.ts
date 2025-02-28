describe('Quasar Tie Carrier', function () {
    integration(function (contextRef) {
        it('Quasar Tie Carrier\'s ability should create a tie fighter token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['quasar-tie-carrier'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quasarTieCarrier);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            const tieFighters = context.player1.findCardsByName('tie-fighter');
            expect(tieFighters.length).toBe(1);
            expect(tieFighters).toAllBeInZone('spaceArena');
            expect(tieFighters.every((tie) => tie.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
