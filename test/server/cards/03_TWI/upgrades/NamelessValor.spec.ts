describe('Nameless Valor', function() {
    integration(function(contextRef) {
        it('should only attach to token unit and give it Overwhelm', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }, 'battle-droid'],
                    hand: ['nameless-valor', 'trade-federation-shuttle'],
                    leader: { card: 'jyn-erso#resisting-oppression', deployed: true },
                },
                player2: {
                    groundArena: ['coruscant-guard']
                }
            });
            const { context } = contextRef;

            // attach upgrade only to token unit.
            context.player1.clickCard(context.namelessValor);
            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(context.player1).toBeAbleToSelectExactly([battleDroids[0]]);
            context.player1.clickCard(battleDroids[0]);

            // next step setup
            battleDroids[0].exhausted = false;
            context.player2.passAction();

            // token gains overwhelm
            context.player1.clickCard(battleDroids[0]);
            context.player1.clickCard(context.coruscantGuard);
            expect(context.p2Base.damage).toBe(1);
        });
    });
});
