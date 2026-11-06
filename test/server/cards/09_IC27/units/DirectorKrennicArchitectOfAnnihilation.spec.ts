describe('Director Krennic, Architect of Annihilation', function() {
    integration(function(contextRef) {
        it('should allow the controller to play a unit that costs 7 or more from hand for 2 resources less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['atst', 'eye-of-sion#delivered-from-exile', 'bendu#do-you-fear-the-storm', 'maximum-firepower'],
                    groundArena: ['director-krennic#architect-of-annihilation'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.directorKrennic);
            expect(context.player1).toHaveEnabledPromptButtons(['Play a unit that costs 7 or more from your hand. It costs 2 resources less', 'Attack']);

            context.player1.clickPrompt('Play a unit that costs 7 or more from your hand. It costs 2 resources less');
            expect(context.directorKrennic.exhausted).toBe(true);

            // Eye of Sion (7) and Bendu (8) cost 7 or more; AT-ST costs 6 and Maximum Firepower is not a unit
            expect(context.player1).toBeAbleToSelectExactly([context.eyeOfSion, context.bendu]);
            context.player1.clickCard(context.eyeOfSion);

            expect(context.eyeOfSion).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
