describe('Eravana, Hauling Rathtars', function () {
    integration(function (contextRef) {
        it('Eravana\'s on attack ability should create a Beast token and readies it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['eravana#hauling-rathtars']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.eravana);
            context.player1.clickCard(context.p2Base);

            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
            expect(beast.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('Eravana\'s on attack ability should create a Beast token and readies it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    spaceArena: ['eravana#hauling-rathtars']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.eravana);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Beast tokens instead');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.moffJerjerrod).toBeInZone('discard');

            const beasts = context.player1.findCardsByName('beast', 'groundArena');
            expect(beasts.length).toBe(2);

            for (const beast of beasts) {
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(beast.exhausted).toBeFalse();
            }
        });
    });
});
