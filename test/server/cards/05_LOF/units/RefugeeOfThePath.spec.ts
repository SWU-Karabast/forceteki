describe('Refugee of the Path', function() {
    integration(function(contextRef) {
        it('Refugee of the Path\'s ability should get a shield token to a unit with sentinel', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['refugee-of-the-path'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['protector'] }, 'wampa', 'echo-base-defender']
                },
                player2: {
                    spaceArena: ['corellian-freighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.refugeeOfThePath);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.echoBaseDefender, context.corellianFreighter]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['protector', 'shield']);
        });
    });
});