describe('Grand Army Marine', function() {
    integration(function(contextRef) {
        it('Grand Army Marine\'s ability should give a Shield token to a friendly Gungan unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grand-army-marine'],
                    groundArena: ['gungan-warrior', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['peppi-bow#shaak-herder']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandArmyMarine);

            expect(context.player1).toHavePrompt('Give a Shield token to a friendly Gungan unit');
            expect(context.player1).toBeAbleToSelectExactly([context.grandArmyMarine, context.gunganWarrior]);
            context.player1.clickCard(context.gunganWarrior);

            expect(context.gunganWarrior).toHaveExactUpgradeNames(['shield']);
            expect(context.grandArmyMarine).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
