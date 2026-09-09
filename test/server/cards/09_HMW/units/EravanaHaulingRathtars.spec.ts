describe('Eravana, Hauling Rathtars', function () {
    integration(function (contextRef) {
        it('Eravana\'s on attack ability should create a Beast token and readies it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'sly-moore#cipher-in-the-dark',
                    base: 'data-vault',
                    resources: 8,
                    spaceArena: ['eravana#hauling-rathtars']
                },
                player2: {
                    base: 'data-vault'
                }
            });

            const { context } = contextRef;
            const eravana = context.player1.findCardByName('eravana#hauling-rathtars');

            context.player1.clickCard(eravana);
            context.player1.clickCard(context.p2Base);

            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
            expect(beast.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
