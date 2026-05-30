describe('Alphabet Squadron U-Wing', function() {
    integration(function(contextRef) {
        it('Alphabet Squadron U-Wing\'s ability should give an Advantage token when regroup phase starts', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['alphabet-squadron-uwing#quiet-devotion'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.passAction();

            expect(context.player1).toHavePrompt('Give an Advantage token to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.awing, context.alphabetSquadronUwing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.wampa);

            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
        });
    });
});
