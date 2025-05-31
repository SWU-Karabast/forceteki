describe('Directed by the Force', function () {
    integration(function (contextRef) {
        it('Directed by the Force\'s ability should give you the force and allow you to play a unit from hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'echo-base',
                    hand: ['directed-by-the-force', 'gamorrean-retainer', 'daring-raid'],
                    hasForceToken: false,
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.directedByTheForce);
            expect(context.player1).toBeAbleToSelectExactly([context.gamorreanRetainer]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickCard(context.gamorreanRetainer);
            expect(context.player1.hasTheForce).toBeTrue();
            expect(context.gamorreanRetainer).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('Directed by the Force\'s ability should give you the force and allow you to not play a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'echo-base',
                    hand: ['directed-by-the-force', 'gamorrean-retainer', 'daring-raid'],
                    hasForceToken: false,
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.directedByTheForce);
            expect(context.player1).toBeAbleToSelectExactly([context.gamorreanRetainer]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickPrompt('Choose nothing');
            expect(context.player1.hasTheForce).toBeTrue();
            expect(context.gamorreanRetainer).toBeInZone('hand');
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});
