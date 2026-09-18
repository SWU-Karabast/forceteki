describe('Ezra Bridger, What Are You Afraid Of?', function() {
    integration(function(contextRef) {
        it('Ezra Bridger\'s ability should deal 3 damage to his base to create a Beast while taking initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#what-are-you-afraid-of'],
                },
            });

            const { context } = contextRef;

            context.player1.claimInitiative();

            expect(context.player1).toHavePassAbilityPrompt('Deal 3 damage to your base to create a Beast token');
            context.player1.clickPrompt('Trigger');

            expect(context.p1Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
        });

        it('Ezra Bridger\'s ability should deal 3 damage to his base to create a Beast while taking initiative (can be pass)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#what-are-you-afraid-of'],
                },
            });

            const { context } = contextRef;

            context.player1.claimInitiative();
            context.player1.clickPrompt('Pass');

            expect(context.p1Base.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
        });

        it('Ezra Bridger\'s ability should do nothing if not taking initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#what-are-you-afraid-of'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ezraBridger);
            context.player1.clickCard(context.p2Base);

            context.player2.claimInitiative();
            context.player1.passAction();

            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
        });
    });
});
