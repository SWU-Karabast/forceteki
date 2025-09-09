describe('Political Bully', function() {
    integration(function(contextRef) {
        it('Political Bully\'s when played ability should deal 2 damage to a ground unit if you control another Official', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['political-bully'],
                    groundArena: ['corrupt-politician']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // Play Political Bully from hand
            context.player1.clickCard(context.politicalBully);

            expect(context.player1).toHavePassAbilityPrompt('If you control another Official unit, you may deal 2 damage to a ground unit');
            context.player1.clickPrompt('Trigger');

            // Should be able to select an enemy ground unit
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.corruptPolitician, context.politicalBully]);

            // Choose target to deal 2 damage
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Political Bully\'s when played ability should not trigger if you don\'t control another Official', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['political-bully']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'corrupt-politician']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.politicalBully);

            // No selection should be prompted, turn should pass
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(0);
        });
    });
});
