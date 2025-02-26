
describe('Steadfast Senator', function() {
    integration(function(contextRef) {
        it('should Attack with a unit. It gets +2/+0 for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['steadfast-senator', 'battlefield-marine'],
                    spaceArena: ['padawan-starfighter'],
                    resources: 2
                },

            });

            const { context } = contextRef;
            context.player1.clickCard(context.steadfastSenator);
            context.player1.clickPrompt('Attack with a unit. It gets +2/+0 for this attack');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.padawanStarfighter, context.steadfastSenator]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.steadfastSenator.exhausted).toBeTrue();
        });
    });
});
