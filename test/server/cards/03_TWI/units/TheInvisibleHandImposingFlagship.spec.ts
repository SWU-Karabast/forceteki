describe('The Invisible Hand Imposing Flagship\'s ability', function() {
    integration(function(contextRef) {
        it('should deal damage to opponent base for each friendly Separarist units exhausted on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['providence-destroyer', 'morgan-elsbeth#keeper-of-many-secrets', 'planetary-invasion'],
                    groundArena: ['warrior-drone', 'droid-commando'],
                    spaceArena: ['the-invisible-hand#imposing-flagship']
                }
            });

            const { context } = contextRef;

            // play Separatist unit, able to exhaust unit of same cost or less.
            context.player1.clickCard(context.theInvisibleHand);
            context.player1.clickCard(context.player2.base);
            expect(context.player1).toBeAbleToSelectExactly([
                context.warriorDrone,
                context.droidCommando
            ]);
            context.player1.clickCard(context.warriorDrone);
            context.player1.clickPrompt('Done');
            expect(context.player2.base.damage).toBe(5);
        });
    });
});
