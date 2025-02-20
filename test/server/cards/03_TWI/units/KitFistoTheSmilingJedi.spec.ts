describe('Kit Fisto, The Smiling Jedi', function() {
    integration(function(contextRef) {
        it('on attack Coordinate ability should deal 3 damage to ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['kit-fisto#the-smiling-jedi', 'battlefield-marine'],
                    spaceArena: ['wing-leader'],
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: ['atst'],
                    spaceArena: ['tieln-fighter']
                },
            });

            const { context } = contextRef;

            // Coordinate active
            context.player1.clickCard(context.kitFisto);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactPromptButtons(['Deal 3 damage to a ground unit', 'Saboteur: defeat all shields']);
            context.player1.clickPrompt('Deal 3 damage to a ground unit');
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.kitFisto, context.battlefieldMarine]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(3);

            // Coordinate offline
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.battlefieldMarine);

            context.kitFisto.exhausted = false;
            context.player1.clickCard(context.kitFisto);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
