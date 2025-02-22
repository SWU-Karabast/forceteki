describe('The Invisible Hand Imposing Flagship\'s ability', function() {
    integration(function(contextRef) {
        it('should create 4 battle droid tokens when played and it can exhaust the token on the next attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-invisible-hand#imposing-flagship'],
                },
                player2: {
                    groundArena: ['warrior-drone']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.theInvisibleHand);
            const battleDroidTokens = context.player1.findCardsByName('battle-droid');
            expect(battleDroidTokens.length).toBe(4);

            context.moveToNextActionPhase();
            expect(battleDroidTokens.every((token) => !token.exhausted)).toBeTrue();
            context.player1.clickCard(context.theInvisibleHand);
            context.player1.clickCard(context.player2.base);
            context.player1.clickPrompt('Pass'); // It fails because we do not enter the targetResolver
        });

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

            context.player1.clickCard(context.theInvisibleHand);
            context.player1.clickCard(context.player2.base);
            expect(context.player1).toBeAbleToSelectExactly([
                context.warriorDrone,
                context.droidCommando
            ]);
            context.player1.clickCard(context.warriorDrone);
            context.player1.clickCard(context.droidCommando);
            context.player1.clickPrompt('Done');
            expect(context.player2.base.damage).toBe(6);
            expect(context.warriorDrone.exhausted).toBe(true);
            expect(context.droidCommando.exhausted).toBe(true);
        });
    });
});
