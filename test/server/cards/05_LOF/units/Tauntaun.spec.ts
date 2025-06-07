describe('Tauntaun', function() {
    integration(function(contextRef) {
        it('Tauntaun\'s when defeated ability allows giving a Shield token to a damaged non-Vehicle unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['tauntaun', { card: 'battlefield-marine', damage: 1 }, 'wampa', { card: 'atst', damage: 1 }],
                },
                player2: {
                    groundArena: ['sith-trooper'],
                    hand: ['precision-fire']
                }
            });
            const { context } = contextRef;

            context.player1.passAction();

            // Defeat the Tauntaun
            context.player2.clickCard(context.sithTrooper);
            context.player2.clickCard(context.tauntaun);

            // Tauntaun's ability should trigger
            expect(context.player1).toHavePrompt('Tauntaun');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]); // no undamaged units or vehicles

            context.player1.clickCard(context.battlefieldMarine);

            // Verify shield token was added
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
        });
        it('Tauntaun\'s when defeated ability should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['tauntaun'],
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', damage: 1 }, 'wampa', { card: 'atst', damage: 1 }],
                    hand: ['no-glory-only-results']
                }
            });

            const { context } = contextRef;
            context.player1.passAction();

            // Player 2 uses NoGloryOnlyResults to take control and defeat the Tauntaun
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.tauntaun);

            // Tauntaun's ability should trigger when defeated
            expect(context.player2).toHavePrompt('Tauntaun');
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]); // no undamaged units or vehicles

            context.player2.clickCard(context.battlefieldMarine);
            // Verify shield was given to the damaged unit
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
        });
    });
});
