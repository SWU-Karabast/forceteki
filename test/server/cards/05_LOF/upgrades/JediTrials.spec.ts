describe('Jedi Trials', function () {
    integration(function (contextRef) {
        it('Jedi Trials\'s ability should give an experience token on attack and give Jedi trait when attached unit have 4 or more upgrades', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['knights-saber'],
                    groundArena: [{ card: 'guardian-of-the-whills', upgrades: ['jedi-trials', 'experience', 'experience'] }, 'gungi#finding-himself'],
                    spaceArena: ['green-squadron-awing'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.knightsSaber);

            // cannot select guardian of the whills (he is not jedi)
            expect(context.player1).toBeAbleToSelectExactly([context.gungi]);
            context.player1.clickPrompt('Cancel');

            context.player1.clickCard(context.guardianOfTheWhills);
            context.player1.clickCard(context.p2Base);

            // guardian of the whills gains 1 experience
            expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['jedi-trials', 'experience', 'experience', 'experience']);

            context.player2.passAction();

            context.player1.clickCard(context.knightsSaber);

            // guardian of the whills became a jedi, knight's saber can attach to him
            expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.guardianOfTheWhills]);
            context.player1.clickCard(context.guardianOfTheWhills);
        });
    });
});
